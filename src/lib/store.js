"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase, usernameToEmail, USERNAME_RE } from "./supabase";

/* ------------------------------------------------------------------
   One provider for auth + app state.
   Guests: state lives in localStorage under "impromptu:v2".
   Signed in: state lives in user_settings (and is mirrored locally so
   the UI paints before the round trip).
   ------------------------------------------------------------------ */

const KEY = "impromptu:v2";
const EMPTY = { theme: "light", diff: 0, cats: null, history: [], favs: [], notes: {}, checks: {}, defs: {} };

const Ctx = createContext(null);

function readLocal() {
  try { return Object.assign({}, EMPTY, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { return { ...EMPTY }; }
}
function writeLocal(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

export function StoreProvider({ children }) {
  const [S, setS] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);       // supabase auth user
  const [profile, setProfile] = useState(null); // profiles row
  const [toastMsg, setToastMsg] = useState("");
  const saveT = useRef(null);
  const toastT = useRef(null);
  const userRef = useRef(null); userRef.current = user;  // so `update` stays stable across login
  const sb = supabase();

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(""), 2800);
  }, []);

  /* theme is applied to <html> so every page and the doc pages pick it up */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", S.theme);
    const m = document.querySelector("meta[name=theme-color]");
    if (m) m.setAttribute("content", S.theme === "dark" ? "#0A0A0D" : "#FBFBFD");
  }, [S.theme]);

  /* persist: local always, remote when signed in (debounced) */
  const persist = useCallback((next, uid) => {
    writeLocal(next);
    if (!sb || !uid) return;
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      sb.from("user_settings").upsert({
        user_id: uid,
        theme: next.theme,
        difficulty_filter: next.diff,
        category_filters: next.cats,
        notes: next.notes,
        checks: next.checks,
        history: next.history,
        favs: next.favs,
        updated_at: new Date().toISOString(),
      }).then(({ error }) => { if (error) console.warn("settings sync failed", error.message); });
    }, 500);
  }, [sb]);

  const update = useCallback((patch) => {
    setS((prev) => {
      const next = Object.assign({}, prev, typeof patch === "function" ? patch(prev) : patch);
      persist(next, userRef.current && userRef.current.id);
      return next;
    });
  }, [persist]);

  const loadProfile = useCallback(async (u) => {
    if (!sb || !u) { setProfile(null); return; }
    const { data } = await sb.from("profiles").select("*").eq("id", u.id).maybeSingle();
    setProfile(data || null);
    const { data: st } = await sb.from("user_settings").select("*").eq("user_id", u.id).maybeSingle();
    if (st) {
      setS((prev) => {
        const next = Object.assign({}, prev, {
          theme: st.theme || prev.theme,
          diff: st.difficulty_filter ?? prev.diff,
          cats: st.category_filters,
          notes: st.notes || {},
          checks: st.checks || {},
          history: st.history || [],
          favs: st.favs || [],
        });
        writeLocal(next);
        return next;
      });
    }
  }, [sb]);

  /* boot */
  useEffect(() => {
    setS(readLocal());
    setReady(true);
    if (!sb) return;
    let unsub = null;
    sb.auth.getSession().then(({ data }) => {
      const u = data.session ? data.session.user : null;
      setUser(u); loadProfile(u);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_ev, session) => {
      const u = session ? session.user : null;
      setUser(u); loadProfile(u);
    });
    unsub = () => sub.subscription.unsubscribe();
    return () => { if (unsub) unsub(); };
  }, [sb, loadProfile]);

  /* ---------- auth actions ---------- */
  async function signup({ username, displayName, password }) {
    if (!sb) throw new Error("Accounts are not configured on this deployment.");
    const u = username.trim().toLowerCase();
    if (!USERNAME_RE.test(u)) throw new Error("Username must be 3–20 characters: letters, numbers, underscores.");
    if (!displayName.trim()) throw new Error("Display name is required.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    const { data: taken } = await sb.rpc("username_taken", { u });
    if (taken) throw new Error("That username is taken.");
    const { data, error } = await sb.auth.signUp({
      email: usernameToEmail(u), password,
      options: { data: { username: u, display_name: displayName.trim() } },
    });
    if (error) throw new Error(friendlyAuthError(error.message));
    const uid = data.user && data.user.id;
    if (!data.session) throw new Error("Sign-up needs email confirmation turned off in Supabase (Auth → Providers → Email).");
    const { error: pErr } = await sb.from("profiles").insert({ id: uid, username: u, display_name: displayName.trim() });
    if (pErr) throw new Error("Could not create profile: " + pErr.message);
    // carry guest state across so nothing is lost
    const local = readLocal();
    await sb.from("user_settings").upsert({
      user_id: uid, theme: local.theme, difficulty_filter: local.diff, category_filters: local.cats,
      notes: local.notes, checks: local.checks, history: local.history, favs: local.favs,
    });
    await loadProfile(data.user);
  }

  async function login({ username, password }) {
    if (!sb) throw new Error("Accounts are not configured on this deployment.");
    const { error } = await sb.auth.signInWithPassword({ email: usernameToEmail(username), password });
    if (error) throw new Error(friendlyAuthError(error.message));
  }

  async function logout() {
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null); setProfile(null);
    setS(readLocal());
  }

  async function saveApiKey(key) {
    if (!sb || !user) throw new Error("Sign in to save an API key.");
    const { error } = await sb.from("profiles").update({ openai_api_key: key || null }).eq("id", user.id);
    if (error) throw new Error(error.message);
    setProfile((p) => Object.assign({}, p, { openai_api_key: key || null }));
  }

  async function updateProfile(patch) {
    if (!sb || !user) throw new Error("Sign in first.");
    const { error } = await sb.from("profiles").update(patch).eq("id", user.id);
    if (error) throw new Error(error.message);
    setProfile((p) => Object.assign({}, p, patch));
  }
  const updateDisplayName = (displayName) => updateProfile({ display_name: displayName.trim() });

  async function exportData() {
    if (!sb || !user) return null;
    const [{ data: prof }, { data: settings }, { data: speeches }] = await Promise.all([
      sb.from("profiles").select("id, username, display_name, created_at").eq("id", user.id).maybeSingle(),
      sb.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
      sb.from("speeches").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    return { exported_at: new Date().toISOString(), profile: prof, settings, speeches: speeches || [] };
  }

  async function deleteAccount() {
    if (!sb || !user) return;
    const { error } = await sb.rpc("delete_own_account");
    if (error) throw new Error(error.message);
    await sb.auth.signOut();
    setUser(null); setProfile(null);
    try { localStorage.removeItem(KEY); } catch (e) {}
    setS({ ...EMPTY });
  }

  const value = {
    S, update, ready, user, profile, toast, toastMsg,
    signup, login, logout, saveApiKey, updateDisplayName, updateProfile, exportData, deleteAccount,
    sb,
    setTheme: (t) => update({ theme: t }),
    hasAccounts: !!sb,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside StoreProvider");
  return v;
}

function friendlyAuthError(msg) {
  if (/invalid login credentials/i.test(msg)) return "Wrong username or password.";
  if (/already registered/i.test(msg)) return "That username is taken.";
  if (/rate limit/i.test(msg)) return "Too many attempts. Wait a moment and try again.";
  return msg;
}
