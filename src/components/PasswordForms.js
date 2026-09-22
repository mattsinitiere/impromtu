"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export function ForgotPassword() {
  const { requestPasswordReset, hasAccounts, toast } = useStore();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr("");
    try { await requestPasswordReset(email); setSent(true); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="wrap page"><div className="form">
      <div className="page-hd" style={{ textAlign: "center", margin: "0 auto 24px" }}>
        <p className="eyebrow">Reset password</p>
        <h1>{sent ? "Check your email." : "Forgot it? Happens."}</h1>
        <p>{sent ? <>If <b>{email.trim()}</b> has an account, a reset link is on its way. It sometimes lands in spam.</> : "Enter the email on the account and we'll send a link to set a new password."}</p>
      </div>
      {!sent && (
        <form className="form-card" onSubmit={submit}>
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="e">Email</label>
            <input id="e" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn btn--primary" type="submit" disabled={busy || !hasAccounts}>{busy ? "Sending…" : "Send reset link"}</button>
          <div className="form-foot"><Link href="/login">Back to log in</Link></div>
        </form>
      )}
      {sent && <div className="form-foot"><Link href="/login">Back to log in</Link></div>}
    </div></section>
  );
}

export function ResetPassword() {
  const { updatePassword, user, ready, toast } = useStore();
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [waited, setWaited] = useState(false);

  /* the link puts a recovery session in the URL fragment; give the client a
     moment to pick it up before declaring the link dead */
  useEffect(() => { const t = setTimeout(() => setWaited(true), 2500); return () => clearTimeout(t); }, []);

  async function submit(e) {
    e.preventDefault();
    if (pw !== pw2) { setErr("The two passwords don't match."); return; }
    setBusy(true); setErr("");
    try { await updatePassword(pw); toast("Password updated. You're signed in."); router.push("/"); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  }

  const ok = ready && !!user; // a recovery session, or any signed-in session, may set a new password
  return (
    <section className="wrap page"><div className="form">
      <div className="page-hd" style={{ textAlign: "center", margin: "0 auto 24px" }}>
        <p className="eyebrow">Reset password</p>
        <h1>Choose a new password.</h1>
      </div>
      {ok ? (
        <form className="form-card" onSubmit={submit}>
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="p1">New password</label>
            <input id="p1" className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} autoFocus />
            <span className="help">At least 8 characters.</span>
          </div>
          <div className="field">
            <label htmlFor="p2">Repeat it</label>
            <input id="p2" className="input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} required minLength={8} />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Set password"}</button>
        </form>
      ) : waited ? (
        <div className="form-card">
          <div className="err">This reset link is invalid or has expired. They last one hour.</div>
          <Link className="btn" href="/forgot-password">Request a new one</Link>
        </div>
      ) : (
        <div className="an-load"><span className="spinner" />Checking the link…</div>
      )}
    </div></section>
  );
}
