import { supabaseAdmin, userFromRequest, json, fail, route } from "@/lib/server/admin";
import { stripe } from "@/lib/server/stripe";

export const runtime = "nodejs";

/* Delete the caller's account. Cancels any Stripe subscription immediately
   first, so a deleted user is never billed again, then removes the auth
   user (profile, settings, speeches, subscription and usage cascade). */
export const POST = route(async (req) => {
  const user = await userFromRequest(req);
  if (!user) return fail("auth", "Sign in first.", 401);
  const db = supabaseAdmin();
  const { data: sub } = await db.from("subscriptions").select("stripe_subscription_id, stripe_customer_id, status").eq("user_id", user.id).maybeSingle();
  if (sub && sub.stripe_subscription_id && sub.status && !["canceled", "incomplete_expired"].includes(sub.status)) {
    try { await stripe().subscriptions.cancel(sub.stripe_subscription_id, { prorate: false }); }
    catch (e) {
      if (!/No such subscription|already canceled/i.test(e.message || "")) {
        return fail("stripe", "Could not cancel the subscription, so the account was not deleted. Try again or contact support: " + e.message, 502);
      }
    }
  }
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) return fail("server", error.message, 500);
  return json({ ok: true });
});
