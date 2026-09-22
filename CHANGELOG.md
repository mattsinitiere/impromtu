# Changelog

All notable changes to Impromptu are recorded here.
This project follows [Semantic Versioning](https://semver.org/).

## [2.0.0] — 2026-09-22

The single-file static app became a Next.js application with an optional
account and a graded speech recorder.

### Added
- **Plans.** Practising is free. Recording and grading need a plan: a 7-day
  free trial (card required, via Stripe Checkout with Stripe Tax), then $3 a
  month, capped at three graded takes per UTC day. Manage, cancel and download
  invoices from Stripe's portal in Settings. Deleting an account cancels the
  subscription first.
- **Server-side grading.** Audio goes to `/api/analyze`, which verifies the
  session, the plan and the daily cap atomically, then calls OpenAI on the
  site's own key. Users no longer supply an API key or choose a model.
- **Record the minute.** A record button starts the microphone and the
  sixty-second clock together; the recording stops with the clock or when you
  stop early.
- **Transcription and grading.** The audio is transcribed by OpenAI Whisper
  and graded by GPT-4o mini against a fixed rubric: A+ to F, with 1–10 scores
  for clarity, structure, accuracy and delivery, word count, length, words per
  minute, every filler word counted (locally, then handed to the model), two
  or three strengths and three or four specific pointers. The transcript is
  attached.
- **Speeches page.** Every graded take, grouped by topic with a
  take-by-take grade trend, re-record, delete, and the full report.
- **Accounts.** Email + username + display name + password, email confirmed
  before first login, password reset by email, change password in Settings.
  Backed by Supabase Auth; a database trigger creates the profile row; row-
  level security on every table. Guest state carries into a new account on
  first sign-in.
- **Settings page.** Plan status and billing, display name, password, theme,
  **Download my data** (one JSON file) and **Delete account** (immediate,
  cascading, cancels billing).
- **Real URLs.** `/how`, `/categories`, `/about`, `/mission`, `/privacy`,
  `/terms`, `/contact`, `/login`, `/signup`, `/forgot-password`,
  `/reset-password`, `/settings`, `/speeches`.
  Category tags and the speeches page deep-link back into the app.
- `ROADMAP.md`, `supabase/migrations/` (four files), `scripts/stripe-setup.mjs`,
  `.env.local.example`.

### Changed
- Rewritten in Next.js 15 / React 19. Same design tokens, layout, dial,
  animations and keyboard shortcuts as v1; the topic corpus moved unchanged to
  `src/lib/topics.js`.
- Guest state key is now `impromptu:v2` (same shape as v1 plus nothing
  breaking). Signed-in state syncs to `user_settings`.
- Privacy and terms pages rewritten for accounts, the API key, and what is
  sent to OpenAI. Mission and about updated to match.
- "How it works" is four steps.

### Fixed
- A `ReferenceError` (`f is not defined`) thrown on every tick of the draw
  animation in v1.

### Removed
- `index.html`, `page.css` and the four standalone HTML pages.

## [1.0.0] — 2026-07-27

Initial release.

### Added
- Random topic generator drawing from 1,117 topics across 107 fields.
- Sixty-tick dial: idles at 1:00, animates while a topic is drawn, then runs
  as the live one-minute presentation countdown.
- Field and difficulty filters (beginner / intermediate / advanced).
- Daily topic, derived deterministically from the calendar date.
- No-repeat logic across the last twelve draws.
- One-sentence definition per topic, fetched from the Wikipedia REST API with a
  title-then-search fallback and cached locally.
- Research workspace: five-item checklist, four seeded angle prompts, and a
  notes field with a live "seconds aloud" estimate at ~140 wpm.
- History (last 60) and a saved-topics list, both restorable in one click.
- Light and dark themes, light by default.
- Keyboard shortcuts: G draw, F save, C copy, T theme, Esc close picker.
- All state persisted to `localStorage` under `impromptu:v1`.
- Standalone Mission, Privacy, Terms and Contact pages sharing `page.css`, each
  inheriting the theme selected in the app.

### Notes
- No backend, no account, no analytics, no third-party scripts.
- Fonts are the only external request (Google Fonts); removing the three
  `<link>` tags in `<head>` makes the app fully self-contained.
