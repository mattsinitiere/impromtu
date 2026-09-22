import { NextResponse } from "next/server";
import { stripe, syncSubscription } from "@/lib/server/stripe";

export const runtime = "nodejs";

/* Stripe → us. Signature-verified against the raw body; anything else is
   rejected. We only ever mirror the subscription object, so a replayed or
   out-of-order event converges on the same state. */
export async function POST(req) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not set" }, { status: 500 });
  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text();
  let event;
  try { event = stripe().webhooks.constructEvent(body, sig, secret); }
  catch (e) { return NextResponse.json({ error: "Bad signature" }, { status: 400 }); }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        if (s.mode === "subscription" && s.subscription) {
          const sub = await stripe().subscriptions.retrieve(typeof s.subscription === "string" ? s.subscription : s.subscription.id);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.trial_will_end":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(event.data.object);
        break;
      case "invoice.payment_failed":
      case "invoice.paid": {
        const inv = event.data.object;
        const subId = inv.subscription || (inv.parent && inv.parent.subscription_details && inv.parent.subscription_details.subscription);
        if (subId) await syncSubscription(await stripe().subscriptions.retrieve(typeof subId === "string" ? subId : subId.id));
        break;
      }
      default: break;
    }
  } catch (e) {
    console.error("webhook", event.type, e.message);
    return NextResponse.json({ error: e.message }, { status: 500 }); // Stripe retries
  }
  return NextResponse.json({ received: true });
}
