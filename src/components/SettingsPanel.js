"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { downloadJSON } from "@/lib/utils";
import { describePlan, PRICE_LABEL, TRIAL_DAYS, DAILY_CAP } from "@/lib/entitlement";

export default function SettingsPanel() {
  const { S, setTheme, user, profile, plan, refreshPlan, hasAccounts, updateDisplayName, updatePassword, exportData, deleteAccount, logout, startCheckout, openPortal, toast, ready } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ name: "", del: "" });

  useEffect(() => { if (profile) setName(profile.display_name || ""); }, [profile]);

  /* back from Stripe Checkout: the webhook may land a few seconds after we do */
  const checkout = params.get("checkout");
  useEffect(() => {
    if (!user || !checkout) return;
    if (checkout === "cancel") { toast("Checkout cancelled. Nothing was charged."); router.replace("/settings"); return; }
    toast("Thanks — setting up your trial…");
    let n = 0;
    const iv = setInterval(async () => { await refreshPlan(); if (++n >= 6) clearInterval(iv); }, 2000);
    router.replace("/settings");
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, checkout]);

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
    try { await deleteAccount(); toast("Your account, plan and everything in it has been deleted."); router.push("/"); }
    catch (ex) { setMsg({ ...msg, del: ex.message }); setBusy(""); }
  }
  async function billing(fn, label) {
    setBusy(label);
    try { await fn(); } catch (ex) { toast(ex.message); setBusy(""); }
  }

  const d = describePlan(plan);
  const canPortal = plan.hasCustomer && plan.status;

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
          <p className="sub">Create an account to record your minute and get it graded — {TRIAL_DAYS} days free, then {PRICE_LABEL}. An email, a username and a password.</p>
          <div className="row-actions">
            <Link className="btn btn--primary" href="/signup">Create account</Link>
            <Link className="btn" href="/login">Log in</Link>
          </div>
        </div>
      )}

      {user && (<>
        <div className="panel">
          <div className="panel-hd"><h3>Plan</h3><span className="count">{plan.active ? `${plan.usedToday} of ${DAILY_CAP} takes today` : ""}</span></div>
          <p className="sub"><b style={{ color: "var(--ink)", fontWeight: 600 }}>{d.title}.</b> {d.sub}</p>
          <div className="row-actions">
            {!plan.active && (plan.status === "past_due" || plan.status === "unpaid") ? (
              <button className="btn btn--primary" onClick={() => billing(openPortal, "portal")} disabled={!!busy}>Update card</button>
            ) : !plan.active ? (
              <button className="btn btn--primary" onClick={() => billing(startCheckout, "checkout")} disabled={!!busy}>{busy === "checkout" ? "Opening Stripe…" : plan.status ? `Subscribe · ${PRICE_LABEL}` : "Start free trial"}</button>
            ) : null}
            {canPortal && <button className="btn" onClick={() => billing(openPortal, "portal")} disabled={!!busy}>{busy === "portal" ? "Opening…" : "Manage billing"}</button>}
          </div>
          <p className="sub" style={{ fontSize: 12.5, marginTop: 12 }}>{DAILY_CAP} graded takes a day. Cancel, change card or download invoices from Manage billing. Payments handled by Stripe; we never see your card.</p>
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
          <p className="sub">Everything Impromptu holds about you — account, plan status, settings, notes, and every graded speech with its transcript — as one JSON file.</p>
          <div className="row-actions">
            <button className="btn" onClick={download} disabled={busy === "dl"}>{busy === "dl" ? "Preparing…" : "Download my data"}</button>
            <button className="btn btn--ghost" onClick={async () => { await logout(); toast("Signed out."); router.push("/"); }}>Log out</button>
          </div>
        </div>

        <div className="panel danger">
          <div className="panel-hd"><h3>Delete account</h3></div>
          <p className="sub">Cancels any subscription immediately, then removes your login, email, profile, settings and every speech. There is no undo.</p>
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
