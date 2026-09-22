/* Pure, isomorphic: the server uses it to gate /api/analyze, the client to
   decide what the Record button says. Both must agree, so this is the only
   place the rule lives. */

export const DAILY_CAP = 3;
export const PRICE_LABEL = "$3 a month";
export const TRIAL_DAYS = 7;

const GRACE_MS = 24 * 3600 * 1000; // webhook lag tolerance around a period end

export function computeEntitlement(sub, usageRow, now = Date.now()) {
  const status = sub ? sub.status : null;
  const periodEnd = sub && sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;
  const inPeriod = periodEnd === null || periodEnd + GRACE_MS > now;
  const active = (status === "trialing" || status === "active") && inPeriod;
  const usedToday = usageRow ? usageRow.takes : 0;
  return {
    active,
    status,                              // raw Stripe status or null
    trialEnd: sub && sub.trial_end ? sub.trial_end : null,
    periodEnd: sub && sub.current_period_end ? sub.current_period_end : null,
    cancelAtPeriodEnd: !!(sub && sub.cancel_at_period_end),
    usedToday,
    cap: DAILY_CAP,
    remaining: Math.max(0, DAILY_CAP - usedToday),
    hasCustomer: !!(sub && sub.stripe_customer_id),
  };
}

/* Today's date in UTC as YYYY-MM-DD, matching bump_usage() in Postgres. */
export function utcDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function describePlan(e) {
  if (!e.status) return { title: "No plan", sub: `Start a free ${TRIAL_DAYS}-day trial, then ${PRICE_LABEL}. Cancel any time.` };
  const d = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  switch (e.status) {
    case "trialing":
      return e.cancelAtPeriodEnd
        ? { title: "Trial · cancelled", sub: `Recording works until ${d(e.trialEnd || e.periodEnd)}. You will not be charged.` }
        : { title: "Free trial", sub: `Ends ${d(e.trialEnd || e.periodEnd)}, then ${PRICE_LABEL}.` };
    case "active":
      return e.cancelAtPeriodEnd
        ? { title: "Cancelled", sub: `Recording works until ${d(e.periodEnd)}.` }
        : { title: "Subscribed", sub: `Renews ${d(e.periodEnd)}.` };
    case "past_due": case "unpaid":
      return { title: "Payment failed", sub: "Update your card to keep recording." };
    case "incomplete": case "incomplete_expired":
      return { title: "Checkout not finished", sub: "Start again to activate the trial." };
    default:
      return { title: "Ended", sub: `Subscribe again for ${PRICE_LABEL}.` };
  }
}
