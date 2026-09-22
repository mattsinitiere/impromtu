import { supabaseAdmin, userFromRequest, json, fail, route } from "@/lib/server/admin";
import { stripe } from "@/lib/server/stripe";

export const runtime = "nodejs";

/* Stripe's hosted billing portal: change card, cancel, see invoices. */
export const POST = route(async (req) => {
  const user = await userFromRequest(req);
  if (!user) return fail("auth", "Sign in first.", 401);
  const { data: row } = await supabaseAdmin().from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!row || !row.stripe_customer_id) return fail("none", "No billing account yet.", 404);
  const origin = req.headers.get("origin") || new URL(req.url).origin;
  try {
    const s = await stripe().billingPortal.sessions.create({ customer: row.stripe_customer_id, return_url: origin + "/settings" });
    return json({ url: s.url });
  } catch (e) {
    return fail("stripe", "Stripe: " + (e.message || "portal failed"), 502);
  }
});
