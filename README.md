# Impromptu

Draw a topic you didn't choose. Research it, write it in your own words, present it for one minute — then get it graded.

Built by Matthew Sinitiere.

**v2.0.0** — Next.js + Supabase. Optional accounts (email + username + password), microphone recording, Whisper transcription, GPT grading A+ to F with filler-word counts and pointers. See [CHANGELOG.md](CHANGELOG.md) and [ROADMAP.md](ROADMAP.md).

---

## Run it locally

```bash
npm install
cp .env.local.example .env.local   # fill in the two Supabase values
npm run dev                        # -> http://localhost:3000
```

Without `.env.local` the app still runs as a guest-only site: drawing, notes and the clock work; log in, sign up and recording are disabled with a clear message.

## Set up Supabase (once)

1. Create a project at [supabase.com](https://supabase.com). Free tier is fine.
2. **SQL Editor** → paste and run each file in `supabase/migrations/` in order (`0001_initial.sql`, `0002_grading_model.sql`, `0003_email_auth.sql`). It creates `profiles`, `speeches`, `user_settings`, their row-level-security policies, three small functions (`username_taken`, `delete_own_account`, `handle_new_user`) and the trigger that creates a profile row for each new auth user.
3. **Authentication → Sign In / Providers → Email** → leave **"Confirm email" on** (the default). Then **Authentication → URL Configuration**: set *Site URL* to your production URL and add these *Redirect URLs*: `https://<your-domain>/**`, `https://*-<your-vercel-team>.vercel.app/**` (previews), `http://localhost:3000/**`. Confirmation and reset links redirect to `/login?confirmed=1` and `/reset-password`; if a URL isn't on that list Supabase falls back to the Site URL.
   The built-in email sender is rate-limited (a handful an hour) and often lands in spam. Fine for testing; add custom SMTP under **Authentication → SMTP** before real users.
4. **Project Settings → API** → copy the Project URL and the anon / publishable key into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The anon key is safe to ship to the browser; every table is locked down by RLS so a session can only see its own rows.

## Deploy it

Vercel, connected to this repository, builds on every push. Add the same two environment variables in **Vercel → Project → Settings → Environment Variables** for Production and Preview. Nothing else is needed: there are no server routes and no secrets on the server.

## What's in the box

```
src/app/                 routes (App Router). One folder per URL.
  layout.js              header, footer, toast, theme, store provider
  page.js                the app: hero, dial, topic card, workspace, recorder
  login/ signup/ forgot-password/ reset-password/ settings/ speeches/
  how/ categories/ about/ mission/ privacy/ terms/ contact/
  globals.css            design tokens and every style; light/dark via [data-theme]
src/components/          Header, Footer, Toast, Dial, TopicCard, Workspace, Library,
                         HomeApp, AuthForm, PasswordForms, SettingsPanel, SpeechHistory,
                         AnalysisPanel, ApiKeyModal
src/lib/
  topics.js              the corpus (RAW), CATS/FLAT, pick/pool/daily helpers
  store.js               React context: guest state in localStorage, signed-in
                         state mirrored to user_settings; auth actions
  supabase.js            browser client (implicit flow so email links work cross-device)
  openai.js              Whisper + chat completions; the grading rubric
  utils.js               time formatting, Wikipedia lookup, chime, JSON download
src/hooks/               useTimer, useRecorder
supabase/migrations/     schema + RLS, run by hand in the SQL editor
public/                  favicon.svg, robots.txt
```

## How recording works

1. **Record the minute** (needs an account). If no OpenAI key is saved you are asked for one right there; it is stored in your `profiles` row and can be changed in Settings.
2. `MediaRecorder` captures the mic (`webm/opus`, falling back to `mp4` on Safari) while the sixty-second clock runs. Stopping early or the clock reaching zero ends the take.
3. The blob goes **straight from the browser** to `api.openai.com/v1/audio/transcriptions` (Whisper, prompted to keep disfluencies). Audio is never stored anywhere.
4. Filler words are counted locally from the transcript, then transcript + counts + topic go to the user's chosen grading model (`gpt-4o-mini` by default, `gpt-4o` selectable in Settings; stored in `profiles.grading_model`) with a fixed rubric and `response_format: json_object`.
5. The result is written to `speeches` with a `version` = number of earlier takes on that topic + 1, and rendered by `AnalysisPanel`.

Cost is billed to the user's own key: roughly $0.006 for Whisper plus a fraction of a cent for the grade.

### Grading dimensions

`clarity`, `structure`, `accuracy`, `delivery` (1–10), `grade` (A+…F), `summary`, `strengths[]`, `improvements[]`, plus computed `wordCount`, `fillerTotal`, `fillers{}`, `durationSeconds`, `wpm`. The rubric lives in `src/lib/openai.js` as `RUBRIC`; edit it there. Changing it changes future grades only.

## Auth model

Email + password via Supabase Auth, with the email confirmed before first login. The username is the public handle and is passed as sign-up metadata; the `on_auth_user_created` trigger (`handle_new_user()`) turns it into a `profiles` row the moment the auth user exists, which is what lets the browser stay out of the loop until the email is confirmed.

- Confirmation link → `/login?confirmed=1` with the session in the URL fragment (implicit flow), so it works in whatever browser the email is opened in; the page notices it is signed in and goes home.
- **Forgot password** → `/forgot-password` sends a reset link → `/reset-password` sets the new one via `auth.updateUser`. Settings also has a change-password field.
- Username uniqueness is enforced twice: by `profiles.username unique` and, before signup, by `username_taken()` (security definer, so it works for anonymous callers).
- `delete_own_account()` deletes the `auth.users` row for the caller; everything else cascades. This is how the browser can delete an account without the service-role key.
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
- Speeches: `speeches` table only. Audio is discarded after transcription.

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

- Set both env vars in Vercel.
- Run all three migrations; set Site URL and Redirect URLs in Supabase; consider custom SMTP.
- Contact email (`src/app/contact/page.js`) and governing law (`src/app/terms/page.js`, Texas) are set; change them if either moves.

## Licence

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Matthew Sinitiere.
