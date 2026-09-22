#!/usr/bin/env node
/* One-time Stripe setup. Creates the product and the $3/month price and
   prints the env vars to set. Run once per mode (test, then live):

     STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
     STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-setup.mjs

   Webhook: create it in the dashboard (Developers → Webhooks → Add endpoint)
   pointing at https://<your-domain>/api/billing/webhook with these events:
     checkout.session.completed
     customer.subscription.created, .updated, .deleted, .trial_will_end
     invoice.paid, invoice.payment_failed
   then copy its signing secret into STRIPE_WEBHOOK_SECRET. */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error("Set STRIPE_SECRET_KEY"); process.exit(1); }
const stripe = new Stripe(key);

const existing = await stripe.products.search({ query: "name:'Impromptu' AND active:'true'" });
const product = existing.data[0] || await stripe.products.create({
  name: "Impromptu",
  description: "Graded one-minute speeches. Three a day.",
  tax_code: "txcd_10103001", // SaaS – personal use
});
const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
const price = prices.data.find((p) => p.recurring && p.recurring.interval === "month" && p.unit_amount === 300 && p.currency === "usd")
  || await stripe.prices.create({ product: product.id, unit_amount: 300, currency: "usd", recurring: { interval: "month" }, tax_behavior: "exclusive" });

console.log(`\nMode: ${key.startsWith("sk_live") ? "LIVE" : "test"}`);
console.log(`Product: ${product.id}`);
console.log(`\nSet in Vercel (and .env.local):\n  STRIPE_SECRET_KEY=${key.slice(0, 12)}…\n  STRIPE_PRICE_ID=${price.id}\n  STRIPE_WEBHOOK_SECRET=whsec_…   (from the webhook you create in the dashboard)\n`);
console.log("Also: Stripe Dashboard → Settings → Tax → enable Stripe Tax (or set STRIPE_TAX=0 to skip tax).");
console.log("And:  Settings → Billing → Customer portal → enable, allow cancellation and payment-method updates.\n");
