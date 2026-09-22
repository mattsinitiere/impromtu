"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { looksLikeKey, GRADING_MODELS, DEFAULT_MODEL } from "@/lib/openai";
import { downloadJSON } from "@/lib/utils";

export default function SettingsPanel() {
  const { S, setTheme, user, profile, hasAccounts, saveApiKey, updateDisplayName, updateProfile, updatePassword, exportData, deleteAccount, logout, toast, ready } = useStore();
  const [pw, setPw] = useState("");
  const model = profile?.grading_model || DEFAULT_MODEL;
  const router = useRouter();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ key: "", name: "", del: "" });

  useEffect(() => { if (profile) { setKey(profile.openai_api_key || ""); setName(profile.display_name || ""); } }, [profile]);

  async function saveKey(e) {
    e.preventDefault();
    const k = key.trim();
    if (k && !looksLikeKey(k)) { setMsg({ ...msg, key: "That doesn't look like an OpenAI key (they start with sk-)." }); return; }
    setBusy("key");
    try { await saveApiKey(k); setMsg({ ...msg, key: "" }); toast(k ? "API key saved." : "API key removed."); }
    catch (ex) { setMsg({ ...msg, key: ex.message }); }
    finally { setBusy(""); }
  }
  async function saveName(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy("name");
    try { await updateDisplayName(name); toast("Display name updated."); }
    catch (ex) { setMsg({ ...msg, name: ex.message }); }
    finally { setBusy(""); }
  }
  async function download() {
    setBusy("dl");
    try { const d = await exportData(); if (d) downloadJSON(d, "impromptu-" + profile.username + ".json"); }
    catch (ex) { toast("Export failed: " + ex.message); }
    finally { setBusy(""); }
  }
  async function destroy() {
    setBusy("del");
    try { await deleteAccount(); toast("Your account and everything in it has been deleted."); router.push("/"); }
    catch (ex) { setMsg({ ...msg, del: ex.message }); setBusy(""); }
  }

  return (
    <section className="wrap page settings">
      <div className="page-hd">
        <p className="eyebrow">Settings</p>
        <h1>Your account.</h1>
        <p>{user ? <>Signed in as <b>@{profile?.username}</b> · {user.email}</> : "You are practising as a guest. Everything is saved in this browser only."}</p>
      </div>

      <div className="panel">
        <div className="panel-hd"><h3>Appearance</h3></div>
        <div className="seg" role="group" aria-label="Theme">
          <button aria-pressed={S.theme === "light"} onClick={() => setTheme("light")}>Light</button>
          <button aria-pressed={S.theme === "dark"} onClick={() => setTheme("dark")}>Dark</button>
        </div>
      </div>

      {ready && !user && hasAccounts && (
        <div className="panel">
          <div className="panel-hd"><h3>Account</h3></div>
          <p className="sub">Create an account to record your minute, get it graded, and keep the history across devices. An email, a username and a password.</p>
          <div className="row-actions">
            <Link className="btn btn--primary" href="/signup">Create account</Link>
            <Link className="btn" href="/login">Log in</Link>
          </div>
        </div>
      )}

      {user && (<>
        <form className="panel" onSubmit={saveKey}>
          <div className="panel-hd"><h3>OpenAI API key</h3><span className="count">{profile?.openai_api_key ? "Set" : "Not set"}</span></div>
          <p className="sub">Recording sends your audio to OpenAI for transcription (Whisper) and grading (the model chosen below), billed to this key — roughly a cent per minute. It is stored in your account row and only ever sent to OpenAI.</p>
          <div className="input-row" style={{ marginTop: 14 }}>
            <input className="input" type={showKey ? "text" : "password"} autoComplete="off" placeholder="sk-…" value={key} onChange={(e) => setKey(e.target.value)} />
            <button type="button" className="btn" onClick={() => setShowKey((s) => !s)}>{showKey ? "Hide" : "Show"}</button>
          </div>
          {msg.key && <div className="err">{msg.key}</div>}
          <div className="row-actions">
            <button className="btn btn--primary" type="submit" disabled={busy === "key"}>Save key</button>
            {profile?.openai_api_key && <button type="button" className="btn btn--ghost" onClick={() => { setKey(""); saveApiKey("").then(() => toast("API key removed.")); }}>Remove key</button>}
          </div>
        </form>

        <div className="panel">
          <div className="panel-hd"><h3>Grading model</h3><span className="count">{GRADING_MODELS.find((m) => m.id === model)?.label}</span></div>
          <p className="sub">Which OpenAI model reads the transcript and writes the grade. Transcription always uses Whisper.</p>
          <div className="seg" role="group" aria-label="Grading model" style={{ marginTop: 14 }}>
            {GRADING_MODELS.map((m) => (
              <button key={m.id} aria-pressed={model === m.id} onClick={() => updateProfile({ grading_model: m.id }).then(() => toast("Grading with " + m.label + ".")).catch((e) => toast(e.message))}>{m.label}</button>
            ))}
          </div>
          <p className="sub" style={{ marginTop: 10 }}>{GRADING_MODELS.find((m) => m.id === model)?.note}</p>
        </div>

        <form className="panel" onSubmit={saveName}>
          <div className="panel-hd"><h3>Display name</h3></div>
          <div className="input-row">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required />
            <button className="btn" type="submit" disabled={busy === "name"}>Save</button>
          </div>
          {msg.name && <div className="err">{msg.name}</div>}
        </form>

        <form className="panel" onSubmit={(e) => { e.preventDefault(); setBusy("pw"); updatePassword(pw).then(() => { setPw(""); toast("Password changed."); }).catch((ex) => toast(ex.message)).finally(() => setBusy("")); }}>
          <div className="panel-hd"><h3>Password</h3></div>
          <div className="input-row">
            <input className="input" type="password" autoComplete="new-password" placeholder="New password (8+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} required />
            <button className="btn" type="submit" disabled={busy === "pw"}>Change</button>
          </div>
        </form>

        <div className="panel">
          <div className="panel-hd"><h3>Your data</h3></div>
          <p className="sub">Everything Impromptu holds about you — profile, settings, notes, and every graded speech with its transcript — as one JSON file.</p>
          <div className="row-actions">
            <button className="btn" onClick={download} disabled={busy === "dl"}>{busy === "dl" ? "Preparing…" : "Download my data"}</button>
            <button className="btn btn--ghost" onClick={async () => { await logout(); toast("Signed out."); router.push("/"); }}>Log out</button>
          </div>
        </div>

        <div className="panel danger">
          <div className="panel-hd"><h3>Delete account</h3></div>
          <p className="sub">Removes your login, email, profile, settings and every speech, immediately. There is no undo.</p>
          {!confirm ? (
            <div className="row-actions"><button className="btn btn--danger" onClick={() => setConfirm(true)}>Delete my account…</button></div>
          ) : (
            <>
              <div className="field"><label>Type <b>@{profile?.username}</b> to confirm</label>
                <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus /></div>
              {msg.del && <div className="err">{msg.del}</div>}
              <div className="row-actions">
                <button className="btn btn--danger" disabled={typed !== "@" + profile?.username && typed !== profile?.username || busy === "del"} onClick={destroy}>{busy === "del" ? "Deleting…" : "Permanently delete"}</button>
                <button className="btn btn--ghost" onClick={() => { setConfirm(false); setTyped(""); }}>Cancel</button>
              </div>
            </>
          )}
        </div>
      </>)}
    </section>
  );
}
