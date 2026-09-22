import "server-only";
import Stripe from "stripe";
import { supabaseAdmin } from "./admin";

let client = null;
export function stripe() {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Server is missing STRIPE_SECRET_KEY.");
  client = new Stripe(key, { appInfo: { name: "Impromptu", url: "https://github.com/mattsinitiere/impromtu" } });
  return client;
}

/* Find or create the Stripe customer for a user; remember the id. */
export async function customerFor(user, profile) {
  const db = supabaseAdmin();
  const { data: row } = await db.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (row && row.stripe_customer_id) return row.stripe_customer_id;
  const c = await stripe().customers.create({
    email: user.email,
    name: profile ? profile.display_name : undefined,
    metadata: { supabase_uid: user.id, username: profile ? profile.username : "" },
  });
  await db.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: c.id, updated_at: new Date().toISOString() });
  return c.id;
}

/* Stripe moved current_period_end onto subscription items in the 2025-03 API. */
function periodEnd(sub) {
  const item = sub.items && sub.items.data && sub.items.data[0];
  const t = (item && item.current_period_end) || sub.current_period_end;
  return t ? new Date(t * 1000).toISOString() : null;
}

/* Mirror a Stripe subscription object into our table. */
export async function syncSubscription(sub) {
  const db = supabaseAdmin();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let uid = sub.metadata && sub.metadata.supabase_uid;
  if (!uid) {
    const { data } = await db.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    uid = data && data.user_id;
  }
  if (!uid) {
    const c = await stripe().customers.retrieve(customerId);
    uid = c && !c.deleted && c.metadata && c.metadata.supabase_uid;
  }
  if (!uid) { console.warn("webhook: no user for customer", customerId); return; }
  await db.from("subscriptions").upsert({
    user_id: uid,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    status: sub.status,
    trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    current_period_end: periodEnd(sub),
    cancel_at_period_end: !!sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
}
