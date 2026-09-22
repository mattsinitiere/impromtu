import { supabaseAdmin, userFromRequest, json, fail, route } from "@/lib/server/admin";
import { stripe, customerFor } from "@/lib/server/stripe";
import { TRIAL_DAYS } from "@/lib/entitlement";

export const runtime = "nodejs";

/* Start the card-required trial: a Stripe Checkout session in subscription
   mode with a 7-day trial. Stripe collects the card and billing address
   (for tax) and bills $3 on day 8 unless cancelled. */
export const POST = route(async (req) => {
  const user = await userFromRequest(req);
  if (!user) return fail("auth", "Sign in first.", 401);
  const price = process.env.STRIPE_PRICE_ID;
  if (!price) return fail("config", "Billing is not configured (STRIPE_PRICE_ID).", 500);

  const db = supabaseAdmin();
  const { data: profile } = await db.from("profiles").select("username, display_name").eq("id", user.id).maybeSingle();
  const { data: existing } = await db.from("subscriptions").select("status, stripe_subscription_id").eq("user_id", user.id).maybeSingle();
  if (existing && (existing.status === "trialing" || existing.status === "active")) {
    return fail("already", "You already have an active plan. Manage it from Settings.", 409);
  }
  // one trial per customer: a returning customer skips straight to paid
  const hadTrial = !!(existing && existing.stripe_subscription_id);

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const customer = await customerFor(user, profile);
  const withTax = process.env.STRIPE_TAX !== "0";
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price, quantity: 1 }],
      subscription_data: {
        metadata: { supabase_uid: user.id },
        ...(hadTrial ? {} : { trial_period_days: TRIAL_DAYS }),
      },
      payment_method_collection: "always",
      allow_promotion_codes: true,
      ...(withTax ? { automatic_tax: { enabled: true }, customer_update: { address: "auto", name: "auto" }, billing_address_collection: "auto" } : {}),
      success_url: origin + "/settings?checkout=success",
      cancel_url: origin + "/settings?checkout=cancel",
      metadata: { supabase_uid: user.id },
    });
    return json({ url: session.url });
  } catch (e) {
    return fail("stripe", "Stripe: " + (e.message || "checkout failed"), 502);
  }
});
