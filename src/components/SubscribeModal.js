"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PRICE_LABEL, TRIAL_DAYS, DAILY_CAP, describePlan } from "@/lib/entitlement";

/* Shown when a signed-in reader presses Record without an active plan. */
export default function SubscribeModal({ onClose }) {
  const { plan, startCheckout, openPortal, toast } = useStore();
  const [busy, setBusy] = useState(false);
  const lapsed = !!plan.status;                 // had a plan before
  const failed = plan.status === "past_due" || plan.status === "unpaid";
  const d = describePlan(plan);

  async function go() {
    setBusy(true);
    try { await (failed ? openPortal() : startCheckout()); }
    catch (e) { toast(e.message); setBusy(false); }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{failed ? "Your last payment failed" : lapsed ? "Your plan has ended" : `Try it free for ${TRIAL_DAYS} days`}</h3>
        <p>{failed ? "Update your card and recording carries on." : `Recording sends your minute to be transcribed and graded, ${DAILY_CAP} takes a day. It is ${PRICE_LABEL} after the trial, cancelled in one click, and the card is not charged until day ${TRIAL_DAYS + 1}.`}</p>
        {lapsed && !failed && <p className="sub" style={{ fontSize: 13.5 }}>{d.title}: {d.sub}</p>}
        <div className="acts">
          <button className="btn btn--ghost" onClick={onClose}>Not now</button>
          <button className="btn btn--primary" onClick={go} disabled={busy}>{busy ? "Opening Stripe…" : failed ? "Update card" : lapsed ? `Subscribe · ${PRICE_LABEL}` : "Start free trial"}</button>
        </div>
        <p className="sub" style={{ fontSize: 12.5, marginTop: 14 }}>Payments by Stripe. Drawing topics, notes and the clock stay free. <Link href="/how">Details</Link>.</p>
      </div>
    </div>
  );
}
