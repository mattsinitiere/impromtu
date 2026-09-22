"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function AuthForm({ mode }) {
  const { signup, login, resendConfirmation, hasAccounts, toast, user, ready } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const isSignup = mode === "signup";
  const confirmed = params.get("confirmed") === "1";

  /* The confirmation link lands here with the session in the URL fragment;
     the client picks it up, so if we are signed in, just go home. */
  useEffect(() => {
    if (!ready) return;
    if (confirmed && user) { toast("Email confirmed. You're signed in."); router.replace("/"); }
  }, [confirmed, user, ready, router, toast]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      if (isSignup) {
        const { needsConfirmation } = await signup({ email, username, displayName, password });
        if (needsConfirmation) { setSent(true); return; }
        toast("Welcome, " + displayName.trim() + "."); router.push("/");
      } else {
        await login({ email, password }); toast("Signed in."); router.push("/");
      }
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  }

  if (sent) {
    return (
      <section className="wrap page"><div className="form">
        <div className="page-hd" style={{ textAlign: "center", margin: "0 auto 24px" }}>
          <p className="eyebrow">One more step</p>
          <h1>Check your email.</h1>
          <p>We sent a confirmation link to <b>{email.trim()}</b>. Click it and you'll be signed in. It can take a minute, and it sometimes lands in spam.</p>
        </div>
        <div className="form-card">
          <p className="sub" style={{ margin: 0, fontSize: 14 }}>Nothing arrived?</p>
          <button className="btn" onClick={() => resendConfirmation(email).then(() => toast("Sent again.")).catch((ex) => toast(ex.message))}>Resend the link</button>
          <div className="form-foot">Wrong address? <a href="#" onClick={(e) => { e.preventDefault(); setSent(false); }}>Go back</a></div>
        </div>
      </div></section>
    );
  }

  return (
    <section className="wrap page">
      <div className="form">
        <div className="page-hd" style={{ textAlign: "center", margin: "0 auto 24px" }}>
          <p className="eyebrow">{isSignup ? "Sign up" : "Log in"}</p>
          <h1>{isSignup ? "Create your account." : "Welcome back."}</h1>
          <p>{isSignup ? "An email to confirm and recover it, a username everyone sees, and a password." : confirmed ? "Email confirmed. Log in to continue." : "Your speeches and settings are waiting."}</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          {!hasAccounts && <div className="err">Accounts are not configured on this deployment.</div>}
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="e">Email</label>
            <input id="e" className="input" type="email" autoComplete="email" inputMode="email"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            {isSignup && <span className="help">Used to confirm the account and reset the password. Never shown to anyone.</span>}
          </div>
          {isSignup && (<>
            <div className="field">
              <label htmlFor="u">Username</label>
              <input id="u" className="input" autoComplete="username" autoCapitalize="off" spellCheck={false}
                value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} required minLength={3} maxLength={20} />
              <span className="help">3–20 characters. Letters, numbers, underscores. Your public @handle.</span>
            </div>
            <div className="field">
              <label htmlFor="d">Display name</label>
              <input id="d" className="input" autoComplete="nickname" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={50} />
              <span className="help">What other people will see. You can change it later.</span>
            </div>
          </>)}
          <div className="field">
            <label htmlFor="p">Password</label>
            <input id="p" className="input" type="password" autoComplete={isSignup ? "new-password" : "current-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={isSignup ? 8 : 1} />
            {isSignup ? <span className="help">At least 8 characters.</span>
              : <span className="help"><Link href="/forgot-password">Forgot your password?</Link></span>}
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
