"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function AuthForm({ mode }) {
  const { signup, login, hasAccounts, toast } = useStore();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      if (isSignup) { await signup({ username, displayName, password }); toast("Welcome, " + displayName.trim() + "."); }
      else { await login({ username, password }); toast("Signed in."); }
      router.push("/");
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="wrap page">
      <div className="form">
        <div className="page-hd" style={{ textAlign: "center", margin: "0 auto 24px" }}>
          <p className="eyebrow">{isSignup ? "Sign up" : "Log in"}</p>
          <h1>{isSignup ? "Pick a username." : "Welcome back."}</h1>
          <p>{isSignup ? "No email, no phone number. Just a name and a password." : "Your speeches and settings are waiting."}</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          {!hasAccounts && <div className="err">Accounts are not configured on this deployment.</div>}
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="u">Username</label>
            <input id="u" className="input" autoComplete="username" autoCapitalize="off" spellCheck={false}
              value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} required autoFocus />
            {isSignup && <span className="help">3–20 characters. Letters, numbers, underscores. This is how you log in.</span>}
          </div>
          {isSignup && (
            <div className="field">
              <label htmlFor="d">Display name</label>
              <input id="d" className="input" autoComplete="nickname" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={50} />
              <span className="help">What other people will see. You can change it later.</span>
            </div>
          )}
          <div className="field">
            <label htmlFor="p">Password</label>
            <input id="p" className="input" type="password" autoComplete={isSignup ? "new-password" : "current-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={isSignup ? 8 : 1} />
            {isSignup && <span className="help">At least 8 characters. There is no email to reset it with, so keep it somewhere safe.</span>}
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn btn--primary" type="submit" disabled={busy || !hasAccounts}>{busy ? "One moment…" : isSignup ? "Create account" : "Log in"}</button>
          <div className="form-foot">
            {isSignup ? <>Already have one? <Link href="/login">Log in</Link></> : <>New here? <Link href="/signup">Create an account</Link></>}
          </div>
        </form>
      </div>
    </section>
  );
}
