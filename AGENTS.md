# AGENTS.md — working on Impromptu

Context for any AI agent or new contributor. Read this before touching code.
`README.md` is the human setup guide; `CHANGELOG.md` is history; `ROADMAP.md`
is what's next. This file is the map.

## What it is

Impromptu draws a random educational topic; the user researches it for ~15
minutes, writes an explanation in their own words, then speaks for one minute.
With an account, the minute is recorded, transcribed (Whisper) and graded
(GPT-4o mini) A+ → F with filler-word counts, four 1–10 scores, strengths and
specific pointers. Free during beta, capped at **3 graded takes per UTC day**
per account. Built and owned by Matthew Sinitiere.

## Where things live

| Thing | Location |
|---|---|
| Repo | https://github.com/mattsinitiere/impromtu (note the spelling: no second "p") |
| Production | https://impromtu-nu.vercel.app |
| Vercel project | `impromtu`, team "Finishes Solutions Projects" (`team_hWy3bbjvN7hYcDjheRueMj5R`), project `prj_CarX93oapQFovCuBySvM55nOxHHf`. Framework preset **must be Next.js** (it was "Other" once and every page 404'd). |
| Supabase project | `ztxfcgygrnvwymyzcgyb` → https://supabase.com/dashboard/project/ztxfcgygrnvwymyzcgyb (API URL `https://ztxfcgygrnvwymyzcgyb.supabase.co`) |
| Contact email (public) | matthewsinitiere7@gmail.com |
| Default branch | `main`. Vercel deploys every push to `main` to production and every other branch to a preview URL. |

Secrets are never in the repo. Names are in `.env.local.example`; values live in
Vercel → Settings → Environment Variables and in each contributor's `.env.local`.

## Stack

- **Next.js 15 (App Router), React 19, plain JavaScript** (no TypeScript), one
  global stylesheet (`src/app/globals.css`) with CSS custom properties and a
  `[data-theme="dark"]` override. No CSS modules, no Tailwind, no UI library.
- **Supabase**: Postgres + Auth (email/password, confirmed email). Browser uses
  the publishable key with RLS; server routes use the service-role key.
- **OpenAI**: `whisper-1` for transcription, `gpt-4o-mini` for grading, both
  overridable by env var. Called only from server routes on the site's key.
- **Stripe**: fully implemented (7-day card-required trial, $3/month, Stripe
  Tax, portal, webhook) but **switched off** unless `NEXT_PUBLIC_BILLING=1`.
- **Vercel** hosting. `/api/analyze` sets `maxDuration = 60`.

## Layout

```
src/app/                    routes; one folder per URL
  layout.js                 <html>, fonts, theme pre-paint script, StoreProvider, Header, Footer, Toast
  page.js                   home = <HomeApp/> in Suspense (uses useSearchParams)
  how/ categories/ about/ mission/ privacy/ terms/ contact/   static content pages
  login/ signup/ forgot-password/ reset-password/ settings/ speeches/
  api/analyze/route.js      POST multipart audio → transcript → grade → speeches row
  api/billing/{checkout,portal,webhook}/route.js               Stripe (inert when billing off)
  api/account/delete/route.js                                  cancel Stripe (if any) → delete auth user
src/components/
  HomeApp.js                the app's state machine: draw, definition, timer, recorder, analysis, deep links
  TopicCard.js Dial.js      the card with the 60-tick dial, filters, category picker
  Workspace.js              notes, angles, checklist, timer + Record button
  AnalysisPanel.js          one graded speech (also used on /speeches)
  Library.js                History / Saved tabs
  AuthForm.js PasswordForms.js SettingsPanel.js SpeechHistory.js SubscribeModal.js
  Header.js Footer.js Toast.js
src/lib/
  topics.js                 the corpus: RAW (107 fields, 1,117 topics), CATS, FLAT, pick/pool/daily
  store.js                  React context: auth, profile, plan, guest/remote state, toast, api() helper
  supabase.js               browser client (implicit auth flow — see Gotchas)
  entitlement.js            THE rule for "may this user record now"; imported by client and server
  utils.js                  fmt, ago, Wikipedia lookup, chime, JSON download, grade colour
  server/admin.js           service-role client, userFromRequest(), json/fail/route() helpers
  server/openai.js          transcribeAudio, analyzeSpeech, countFillers, the RUBRIC
  server/stripe.js          stripe(), customerFor(), syncSubscription()
src/hooks/                  useTimer (60 s countdown), useRecorder (MediaRecorder)
supabase/migrations/        0001 schema+RLS, 0002 (legacy), 0003 email auth trigger, 0004 billing+usage
scripts/stripe-setup.mjs    creates the Stripe product + price
public/                     favicon.svg, robots.txt
```

## Data model (Postgres, all RLS-protected)

- `profiles(id → auth.users, username unique, display_name, created_at)` —
  created by trigger `on_auth_user_created` from sign-up metadata.
- `user_settings(user_id, theme, difficulty_filter, category_filters, notes,
  checks, history, favs)` — the signed-in mirror of guest localStorage state.
- `speeches(id, user_id, topic, field, difficulty, transcript, analysis jsonb,
  duration_seconds, word_count, grade, version, created_at)` — written only by
  the server. `version` = earlier takes on the same topic + 1.
- `usage(user_id, day, takes)` — per-UTC-day counter. `bump_usage(uid, cap)`
  increments atomically and returns false at the cap; `unbump_usage(uid)`
  refunds a failed take. Both are security definer, execute revoked from
  anon/authenticated (server-only).
- `subscriptions(user_id, stripe_customer_id, stripe_subscription_id, status,
  trial_end, current_period_end, cancel_at_period_end)` — mirrored from Stripe
  webhooks; read-only for users; unused while billing is off.
- `username_taken(text)` — security definer so the sign-up form can check
  before an account exists.

Migrations are run by hand in the Supabase SQL editor (the Supabase MCP
connector in Claude sessions is scoped to a different project and cannot run
them). Add a new numbered file for any schema change; never edit an old one.

## Environment variables

| Var | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | publishable key (`sb_publishable_…`); RLS makes it safe |
| `SUPABASE_SERVICE_ROLE_KEY` | server | bypasses RLS; only `src/lib/server/*` |
| `OPENAI_API_KEY` | server | all users' grading runs on it — keep a spend limit on it |
| `OPENAI_GRADING_MODEL` | server | default `gpt-4o-mini` |
| `OPENAI_TRANSCRIBE_MODEL` | server | default `whisper-1` |
| `NEXT_PUBLIC_BILLING` | public | `1` turns Stripe on; unset/`0` = free beta |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_TAX` | server | only when billing is on |

Without the public Supabase vars the site still works as a guest-only app.
Without a server var, the relevant route returns a JSON 500 naming it.

## How the pieces talk

1. Guest state: one `localStorage` key `impromptu:v2`. On first sign-in it is
   copied into `user_settings`; after that `store.update()` writes both.
2. Sign-up → Supabase sends a confirmation email → link lands on
   `/login?confirmed=1` with the session in the URL fragment → client picks it
   up and goes home. Password reset: `/forgot-password` → email → `/reset-password`.
3. Record: `HomeApp.startRecording()` checks user → `plan.active` → `plan.remaining`,
   then starts `useRecorder` + `useTimer` together. Stop/timeout →
   `finishRecording()` → `api("/api/analyze", {form})` with the Supabase access
   token as a bearer → server re-checks everything, `bump_usage`, Whisper, GPT,
   insert → returns the row → `AnalysisPanel`.
4. `computeEntitlement(sub, usageRow)` in `src/lib/entitlement.js` is the only
   place the "can record" rule lives. Change it there and both sides follow.

## Conventions

- Match the existing voice in copy: short, plain, a little dry, no marketing.
  British-leaning spelling in prose ("practise", "licence") because v1 was.
- Keep components small and colocated; prefer a prop over a new context.
- All styles go in `globals.css` using the existing tokens (`--accent`,
  `--paper-2`, `--line`, `.btn`, `.panel`, `.eyebrow`, `.count`, …). Check both
  themes — every colour must come from a token or a `[data-theme="dark"]` rule.
- Server-only modules start with `import "server-only"` and live under
  `src/lib/server/`. Never import them from a client component.
- API routes: wrap the handler in `route()` from `server/admin.js`, verify the
  user first with `userFromRequest(req)`, return errors via `fail(code, message, status)`.
  Codes the client understands: `auth`, `subscribe`, `cap`, `too_short`, `too_large`.
- Topic corpus rules: no `&`, `<`, `>` in names; timeless subjects only; one
  string per field in `RAW`.
- Don't add analytics, tracking, or third-party scripts. Privacy page promises none.
- Commits: imperative subject, body explains why. Don't put model names or
  session IDs in code comments.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # must pass before pushing; also runs lint/type checks
npm start          # serve the production build (used by the smoke test below)
```

There is no test suite yet. The verification that has been used:
`npm run build`, then a headless Chromium pass over every route checking for
page errors, drawing a topic (`G`), running the timer, opening the guest
sign-in modal, theme persistence, the `/categories` deep link, and mobile
overflow at 390 px. Auth, recording and Stripe flows can only be tested against
the live services; the sandbox that built v2 could not reach Supabase, OpenAI,
Wikipedia or `*.vercel.app`.

## Gotchas learned the hard way

- **Vercel framework preset.** The project predates Next.js; if it ever reads
  "Other" again, `next build` runs but `public/` is served statically and every
  page 404s with Vercel's "This page doesn't exist".
- **Deployment Protection.** Vercel Authentication was on for all `*.vercel.app`
  URLs at one point, which walls off production for everyone but the owner and
  breaks email links opened elsewhere. It should be off or preview-only.
- **Supabase URL configuration.** Site URL must be the production URL and the
  Redirect URLs list must include `https://impromtu-nu.vercel.app/**`,
  `https://*-matthew-sinitieres-projects.vercel.app/**`, `http://localhost:3000/**`
  or confirmation/reset links bounce to the wrong place.
- **Implicit auth flow, on purpose.** `supabase.js` sets `flowType: "implicit"`
  so confirmation and reset links work in whichever browser opens the email.
  PKCE would fail the "signed up on laptop, opened email on phone" case.
- **The profile row is made by a trigger**, not by the browser, because with
  email confirmation on there is no session at sign-up time to satisfy RLS.
- **Count the take before calling OpenAI.** `bump_usage` runs first so two
  parallel uploads cannot both pass the cap; a failure refunds with `unbump_usage`.
- **Whisper `verbose_json`** (gives duration) is Whisper-only; the
  `gpt-4o-*-transcribe` models get `response_format: json` and no duration.
- **Filler words.** Counted locally with a fixed list in `server/openai.js` and
  handed to the model as ground truth; Whisper is prompted to keep disfluencies.
  Newer transcription models tend to clean them up, which makes grades kinder.
- **Supabase's built-in mailer** is rate-limited and lands in spam. Custom SMTP
  is on the roadmap and should precede any real user growth.
- **Killing a local `next start`** with `pkill -f next-server` kills the shell
  that ran it (pattern matches itself). Use `pkill -f "[n]ext-server"`.
- Stale server on port 3100 after a rebuild → old HTML references chunks that
  no longer exist → 400s on every asset. Always kill before restarting.

## Turning billing on (when the time comes)

1. `STRIPE_SECRET_KEY=sk_test_… node scripts/stripe-setup.mjs` → `STRIPE_PRICE_ID`.
2. Stripe dashboard: webhook → `/api/billing/webhook` with the events the script
   lists → `STRIPE_WEBHOOK_SECRET`; enable Stripe Tax and the customer portal.
3. Set `NEXT_PUBLIC_BILLING=1` plus the Stripe vars in Vercel; redeploy.
4. Revisit the copy on how / terms / privacy / mission / about / contact — it
   currently describes the free beta. Terms §4 promises 30 days' notice by email.

## Roadmap pointers

See `ROADMAP.md`. Order of intent: make the grade trustworthy (audio playback,
rubric versioning, pace from audio, progress dashboard) → profiles with
Discord-style tags → friends → competitions on a shared topic → classrooms.
Competitions depend on a fair, versioned grade, so they wait.
