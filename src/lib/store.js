"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase, siteOrigin, EMAIL_RE, USERNAME_RE } from "./supabase";
import { computeEntitlement, utcDay } from "./entitlement";

/* ------------------------------------------------------------------
   One provider for auth + app state + plan.
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

function settingsRow(uid, s) {
  return {
    user_id: uid, theme: s.theme, difficulty_filter: s.diff, category_filters: s.cats,
    notes: s.notes, checks: s.checks, history: s.history, favs: s.favs, updated_at: new Date().toISOString(),
  };
}

export function StoreProvider({ children }) {
  const [S, setS] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);       // supabase auth user
  const [profile, setProfile] = useState(null); // profiles row
  const [plan, setPlan] = useState(computeEntitlement(null, null));
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

  /* theme is applied to <html> so every page picks it up */
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
      sb.from("user_settings").upsert(settingsRow(uid, next))
        .then(({ error }) => { if (error) console.warn("settings sync failed", error.message); });
    }, 500);
  }, [sb]);

  const update = useCallback((patch) => {
    setS((prev) => {
      const next = Object.assign({}, prev, typeof patch === "function" ? patch(prev) : patch);
      persist(next, userRef.current && userRef.current.id);
      return next;
    });
  }, [persist]);

  /* plan = subscription row + today's usage, both readable under RLS */
  const refreshPlan = useCallback(async (u) => {
    const uid = u ? u.id : userRef.current && userRef.current.id;
    if (!sb || !uid) { setPlan(computeEntitlement(null, null)); return; }
    const [{ data: sub }, { data: usage }] = await Promise.all([
      sb.from("subscriptions").select("*").eq("user_id", uid).maybeSingle(),
      sb.from("usage").select("*").eq("user_id", uid).eq("day", utcDay()).maybeSingle(),
    ]);
    setPlan(computeEntitlement(sub, usage));
  }, [sb]);

  const loadProfile = useCallback(async (u) => {
    if (!sb || !u) { setProfile(null); setPlan(computeEntitlement(null, null)); return; }
    const { data } = await sb.from("profiles").select("*").eq("id", u.id).maybeSingle();
    setProfile(data || null);
    refreshPlan(u);
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
    } else {
      // first sign-in on this account: carry the guest state across
      await sb.from("user_settings").upsert(settingsRow(u.id, readLocal()));
    }
  }, [sb, refreshPlan]);

  /* boot */
  useEffect(() => {
    setS(readLocal());
    setReady(true);
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      const u = data.session ? data.session.user : null;
      setUser(u); loadProfile(u);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_ev, session) => {
      const u = session ? session.user : null;
      setUser(u); loadProfile(u);
    });
    return () => sub.subscription.unsubscribe();
  }, [sb, loadProfile]);

  /* ---------- authenticated calls to our own API routes ---------- */
  const api = useCallback(async (path, { body, form } = {}) => {
    if (!sb) throw new Error("Accounts are not configured on this deployment.");
    const { data } = await sb.auth.getSession();
    const token = data.session && data.session.access_token;
    if (!token) throw Object.assign(new Error("Sign in first."), { code: "auth" });
    const r = await fetch(path, {
      method: "POST",
      headers: Object.assign({ Authorization: "Bearer " + token }, form ? {} : { "Content-Type": "application/json" }),
      body: form ? form : JSON.stringify(body || {}),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error((j.error && j.error.message) || "Request failed (" + r.status + ")."), { code: j.error && j.error.code, status: r.status });
    return j;
  }, [sb]);

  /* ---------- auth actions ---------- */
  async function signup({ email, username, displayName, password }) {
    if (!sb) throw new Error("Accounts are not configured on this deployment.");
    const e = email.trim().toLowerCase();
    const u = username.trim().toLowerCase();
    if (!EMAIL_RE.test(e)) throw new Error("Enter a valid email address.");
    if (!USERNAME_RE.test(u)) throw new Error("Username must be 3–20 characters: letters, numbers, underscores.");
    if (!displayName.trim()) throw new Error("Display name is required.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    const { data: taken } = await sb.rpc("username_taken", { u });
    if (taken) throw new Error("That username is taken.");
    const { data, error } = await sb.auth.signUp({
      email: e, password,
      options: { data: { username: u, display_name: displayName.trim() }, emailRedirectTo: siteOrigin() + "/login?confirmed=1" },
    });
    if (error) throw new Error(friendlyAuthError(error.message));
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error("That email already has an account. Log in, or reset the password.");
    }
    return { needsConfirmation: !data.session };
  }

  async function login({ email, password }) {
    if (!sb) throw new Error("Accounts are not configured on this deployment.");
    const { error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw new Error(friendlyAuthError(error.message));
  }

  async function resendConfirmation(email) {
    if (!sb) return;
    const { error } = await sb.auth.resend({ type: "signup", email: email.trim().toLowerCase(), options: { emailRedirectTo: siteOrigin() + "/login?confirmed=1" } });
    if (error) throw new Error(friendlyAuthError(error.message));
  }

  async function requestPasswordReset(email) {
    if (!sb) throw new Error("Accounts are not configured on this deployment.");
    const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: siteOrigin() + "/reset-password" });
    if (error) throw new Error(friendlyAuthError(error.message));
  }

  async function updatePassword(password) {
    if (!sb) throw new Error("Accounts are not configured on this deployment.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    const { error } = await sb.auth.updateUser({ password });
    if (error) throw new Error(friendlyAuthError(error.message));
  }

  async function logout() {
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null); setProfile(null); setPlan(computeEntitlement(null, null));
    setS(readLocal());
  }

  async function updateProfile(patch) {
    if (!sb || !user) throw new Error("Sign in first.");
    const { error } = await sb.from("profiles").update(patch).eq("id", user.id);
    if (error) throw new Error(error.message);
    setProfile((p) => Object.assign({}, p, patch));
  }
  const updateDisplayName = (displayName) => updateProfile({ display_name: displayName.trim() });

  /* ---------- billing ---------- */
  async function startCheckout() {
    const { url } = await api("/api/billing/checkout");
    window.location.assign(url);
  }
  async function openPortal() {
    const { url } = await api("/api/billing/portal");
    window.location.assign(url);
  }

  async function exportData() {
    if (!sb || !user) return null;
    const [{ data: prof }, { data: settings }, { data: speeches }, { data: sub }] = await Promise.all([
      sb.from("profiles").select("id, username, display_name, created_at").eq("id", user.id).maybeSingle(),
      sb.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
      sb.from("speeches").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      sb.from("subscriptions").select("status, trial_end, current_period_end, cancel_at_period_end").eq("user_id", user.id).maybeSingle(),
    ]);
    return { exported_at: new Date().toISOString(), account: { email: user.email, created_at: user.created_at }, profile: prof, plan: sub, settings, speeches: speeches || [] };
  }

  async function deleteAccount() {
    if (!sb || !user) return;
    await api("/api/account/delete");
    await sb.auth.signOut();
    setUser(null); setProfile(null); setPlan(computeEntitlement(null, null));
    try { localStorage.removeItem(KEY); } catch (e) {}
    setS({ ...EMPTY });
  }

  const value = {
    S, update, ready, user, profile, plan, refreshPlan, api, toast, toastMsg,
    signup, login, logout, resendConfirmation, requestPasswordReset, updatePassword,
    updateDisplayName, updateProfile, exportData, deleteAccount, startCheckout, openPortal,
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
  if (/invalid login credentials/i.test(msg)) return "Wrong email or password.";
  if (/email not confirmed/i.test(msg)) return "Confirm your email first — check your inbox for the link.";
  if (/already registered/i.test(msg)) return "That email already has an account.";
  if (/rate limit|security purposes/i.test(msg)) return "Too many attempts. Wait a minute and try again.";
  if (/same password/i.test(msg)) return "That is already your password.";
  return msg;
}
