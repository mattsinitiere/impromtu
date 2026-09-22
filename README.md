# Impromptu

Draw a topic you didn't choose. Research it, write it in your own words, present it for one minute — then get it graded.

Built by Matthew Sinitiere.

**v2.0.0** — Next.js + Supabase. Free to practise; accounts (email + username + password) get up to three graded takes a day, free while in beta. Recording → Whisper → GPT-4o mini grade A+ to F with filler-word counts and pointers, all on the site's own OpenAI key behind authenticated API routes. Stripe billing (7-day trial, $3/month) is built and switched off behind `NEXT_PUBLIC_BILLING`. See [CHANGELOG.md](CHANGELOG.md) and [ROADMAP.md](ROADMAP.md).

---

## Run it locally

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase and OpenAI values
npm run dev                        # -> http://localhost:3000
```

Without the public Supabase values the app runs as a guest-only site: drawing, notes and the clock work; log in, sign up and recording are disabled with a clear message. Without the server values, sign-in works but recording and checkout return a clear configuration error.

## Set up Supabase (once)

1. Create a project at [supabase.com](https://supabase.com). Free tier is fine.
2. **SQL Editor** → paste and run each file in `supabase/migrations/` in order (`0001` → `0004`). It creates `profiles`, `speeches`, `user_settings`, their row-level-security policies, three small functions (`username_taken`, `delete_own_account`, `handle_new_user`) and the trigger that creates a profile row for each new auth user.
3. **Authentication → Sign In / Providers → Email** → leave **"Confirm email" on** (the default). Then **Authentication → URL Configuration**: set *Site URL* to your production URL and add these *Redirect URLs*: `https://<your-domain>/**`, `https://*-<your-vercel-team>.vercel.app/**` (previews), `http://localhost:3000/**`. Confirmation and reset links redirect to `/login?confirmed=1` and `/reset-password`; if a URL isn't on that list Supabase falls back to the Site URL.
   The built-in email sender is rate-limited (a handful an hour) and often lands in spam. Fine for testing; add custom SMTP under **Authentication → SMTP** before real users.
4. **Project Settings → API Keys** → the publishable key goes in `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser-safe; RLS locks every table to its owner) and the **secret / service_role** key goes in `SUPABASE_SERVICE_ROLE_KEY` (server only — it bypasses RLS and must never be prefixed `NEXT_PUBLIC_`).

## Set up OpenAI (and, later, Stripe)

1. **OpenAI**: create a key at platform.openai.com with a monthly spend limit set, and put it in `OPENAI_API_KEY`. Every user's recording is graded on this key.
2. **Stripe (only when turning billing on)**: set `NEXT_PUBLIC_BILLING=1`, then `STRIPE_SECRET_KEY=sk_test_… node scripts/stripe-setup.mjs` creates the product and the $3/month price and prints `STRIPE_PRICE_ID`. Then in the dashboard: **Developers → Webhooks → Add endpoint** `https://<your-domain>/api/billing/webhook` with the events the script lists, and copy its signing secret to `STRIPE_WEBHOOK_SECRET`. Enable **Settings → Tax → Stripe Tax** (or set `STRIPE_TAX=0`) and **Settings → Billing → Customer portal** (allow cancel + update payment method). Repeat with `sk_live_` when you go live.
3. Local webhooks: `stripe listen --forward-to localhost:3000/api/billing/webhook` and use the `whsec_` it prints.

## Deploy it

Vercel, connected to this repository, builds on every push. Add the Supabase and OpenAI variables from `.env.local.example` in **Vercel → Project → Settings → Environment Variables** for Production and Preview (Stripe ones only once billing is on). `/api/analyze` declares `maxDuration = 60` because Whisper plus grading takes 15–30 s; Vercel Hobby allows this.

## What's in the box

```
src/app/                 routes (App Router). One folder per URL.
  layout.js              header, footer, toast, theme, store provider
  page.js                the app: hero, dial, topic card, workspace, recorder
  login/ signup/ forgot-password/ reset-password/ settings/ speeches/
  how/ categories/ about/ mission/ privacy/ terms/ contact/
  api/analyze            POST audio → transcript → grade → speeches row (auth, plan, cap)
  api/billing/checkout   POST → Stripe Checkout URL (7-day trial, card required)
  api/billing/portal     POST → Stripe billing portal URL
  api/billing/webhook    POST from Stripe → mirrors subscription status
  api/account/delete     POST → cancels subscription, deletes auth user
  globals.css            design tokens and every style; light/dark via [data-theme]
src/components/          Header, Footer, Toast, Dial, TopicCard, Workspace, Library,
                         HomeApp, AuthForm, PasswordForms, SettingsPanel, SpeechHistory,
                         AnalysisPanel, SubscribeModal
src/lib/
  topics.js              the corpus (RAW), CATS/FLAT, pick/pool/daily helpers
  store.js               React context: guest state in localStorage, signed-in
                         state mirrored to user_settings; auth actions
  supabase.js            browser client (implicit flow so email links work cross-device)
  entitlement.js         the one rule for 'may this user record now' (client + server)
  utils.js               time formatting, Wikipedia lookup, chime, JSON download
  server/admin.js        service-role client + bearer-token verification (server only)
  server/openai.js       Whisper + chat completions; the grading rubric (server only)
  server/stripe.js       Stripe client, customer lookup, subscription mirroring
scripts/stripe-setup.mjs one-time product + price creation
src/hooks/               useTimer, useRecorder
supabase/migrations/     schema + RLS, run by hand in the SQL editor
public/                  favicon.svg, robots.txt
```

## How recording works

1. **Record the minute** needs a signed-in user with fewer than three takes counted today in `usage` (and, when billing is on, an active plan in `subscriptions`). Otherwise the button opens the sign-in or subscribe modal.
2. `MediaRecorder` captures the mic at 48 kbps (`webm/opus`, falling back to `mp4` on Safari) while the sixty-second clock runs. Stopping early or the clock reaching zero ends the take.
3. The blob is POSTed to **`/api/analyze`** with the Supabase access token. The route verifies the token with the service-role client, re-checks the plan and the cap, and calls `bump_usage()` — an atomic insert-or-increment that refuses once today's count reaches three, so parallel requests cannot slip past it. Only then does it upload the audio to Whisper and the transcript to `gpt-4o-mini` on **`OPENAI_API_KEY`**. On failure the take is given back. Audio is never stored.
4. The result is written to `speeches` (service role; the browser has no insert policy) with `version` = earlier takes on that topic + 1, and returned to `AnalysisPanel`.

### Economics

Per graded minute ≈ $0.006 Whisper + ~$0.001 grading ≈ **0.7¢**; the 3-a-day cap makes a user's worst case ~93 takes ≈ 65¢ a month. Free during the beta. If billing is switched on at $3/month, Stripe keeps ~$0.39, so a subscriber nets ~$2.61 and breaks even at ~370 takes. Set a spend limit on the OpenAI key regardless.

### Grading dimensions

`clarity`, `structure`, `accuracy`, `delivery` (1–10), `grade` (A+…F), `summary`, `strengths[]`, `improvements[]`, plus computed `wordCount`, `fillerTotal`, `fillers{}`, `durationSeconds`, `wpm`. The rubric lives in `src/lib/openai.js` as `RUBRIC`; edit it there. Changing it changes future grades only.

## Billing model (dormant)

`NEXT_PUBLIC_BILLING` is unset, so `computeEntitlement()` returns `active` for every signed-in user and the checkout/portal routes answer 404. The Plan panel shows "Free". Set it to `1` with the Stripe variables to enable everything below unchanged.

- Checkout is Stripe-hosted, subscription mode, `trial_period_days: 7`, `payment_method_collection: always`, `automatic_tax` on. Success returns to `/settings?checkout=success`, which polls the plan for ~12 s while the webhook lands.
- The webhook mirrors every subscription event into `subscriptions` (`status`, `trial_end`, `current_period_end`, `cancel_at_period_end`); the row is the only thing the app reads. A missing or unknown status means no plan.
- `computeEntitlement()` in `src/lib/entitlement.js` is the single rule: `trialing` or `active`, and the period end (plus 24 h grace for webhook lag) is in the future. Both the Record button and `/api/analyze` use it.
- One trial per Stripe customer: a returning customer's checkout skips the trial.
- Deleting an account cancels the subscription first (`/api/account/delete`); if Stripe refuses, the account is not deleted and the user is told.

## Auth model

Email + password via Supabase Auth, with the email confirmed before first login. The username is the public handle and is passed as sign-up metadata; the `on_auth_user_created` trigger (`handle_new_user()`) turns it into a `profiles` row the moment the auth user exists, which is what lets the browser stay out of the loop until the email is confirmed.

- Confirmation link → `/login?confirmed=1` with the session in the URL fragment (implicit flow), so it works in whatever browser the email is opened in; the page notices it is signed in and goes home.
- **Forgot password** → `/forgot-password` sends a reset link → `/reset-password` sets the new one via `auth.updateUser`. Settings also has a change-password field.
- Username uniqueness is enforced twice: by `profiles.username unique` and, before signup, by `username_taken()` (security definer, so it works for anonymous callers).
- Account deletion goes through `/api/account/delete` (cancel Stripe, then `auth.admin.deleteUser`); everything else cascades.
- Guest state is copied into `user_settings` on the first sign-in that finds no row.

## The topic corpus

1,117 topics across 107 fields, each tagged `1` beginner, `2` intermediate, `3` advanced.

`src/lib/topics.js`, `RAW`. One string per field:

```
"Field Name|Topic One~1|Topic Two~3|Topic Three~2"
```

Add a string to add a field; append to one to add topics. The category page, the picker, the counts, the daily topic and the filters all read from it.

- **No `&`, `<` or `>` characters** in names.
- **Timeless only.** If it won't be worth understanding in ten years, it doesn't belong.

## Storage

- Guest: one `localStorage` entry, `impromptu:v2` — theme, filters, history, saved, notes, checklist ticks, cached definitions.
- Signed in: the same shape lands in `user_settings` (debounced), and `localStorage` mirrors it so the page paints before the round trip. The first sign-in copies guest state across.
- Speeches: `speeches` table only, written by the server. Audio is discarded after transcription.
- Plan: `subscriptions` and `usage`, written only by the server; readable by their owner.

## Keyboard

| Key | Action |
|-----|--------|
| `G` | Draw a topic |
| `F` | Save / unsave the current topic |
| `C` | Copy the current topic |
| `T` | Toggle light and dark |
| `Esc` | Close the field picker |

Suppressed while typing in a field.

## Before going live

- Set the Supabase and OpenAI env vars in Vercel.
- Run all four migrations; set Site URL and Redirect URLs in Supabase; consider custom SMTP.
- Put a monthly spend limit on the OpenAI key.
- When turning billing on: Stripe keys, webhook, Stripe Tax, customer portal, `NEXT_PUBLIC_BILLING=1`, and revisit the copy on how/terms/privacy/mission/about.
- Contact email (`src/app/contact/page.js`) and governing law (`src/app/terms/page.js`, Texas) are set; change them if either moves.

## Licence

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Matthew Sinitiere.
