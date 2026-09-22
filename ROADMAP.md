# Roadmap

Where Impromptu is going after v2.0. Nothing here is a promise or a date;
it is the order things are likely to happen in, and the reasoning. Items
move between sections as the shape of the thing becomes clearer.

## Shipped in v2.0

- Accounts (email + username + password, confirmed email, reset by email), Supabase backend
- Record the minute, Whisper transcription, GPT grading A+ → F
- Filler-word counting, four scored dimensions, strengths and pointers
- Speech history with takes per topic, re-record, delete, export, delete account

---

## Next: make the grade worth trusting

The single most important thing. Everything social below is only interesting
if the number is fair.

- [ ] **Audio playback.** Keep the recording (Supabase Storage, opt-in, with a
      retention limit) so you can listen back next to the transcript.
- [ ] **Grade calibration.** A fixed rubric version stored on each speech, so a
      B+ in March means the same thing as a B+ in June, and a
      "regrade with latest rubric" button when it changes.
- [ ] **Pace and pauses from the audio, not the transcript.** Whisper
      timestamps give words-per-minute over time and silence gaps; show them as
      a strip under the dial.
- [ ] **Compare two takes side by side** — transcripts diffed, scores overlaid.
- [ ] **Progress dashboard.** Grades over time, filler words per take trending
      down (or not), which fields you dodge, which you score best in.
- [ ] **Streaks and a weekly rhythm**, quietly. A dot per day, no notifications.
- [ ] **Bring-your-own model.** Anthropic and local (Ollama) as grading
      backends alongside OpenAI; same rubric, same JSON shape.
- [ ] **Custom topic pools.** Paste your own list (interview prep, a syllabus,
      a company's product areas) and draw from it privately.

## Profiles

- [ ] Full profile: name, `@handle`, bio, optional phone, avatar.
- [ ] **Tags next to the username**, Discord-style: earned ("100 minutes",
      "Clean take" for zero fillers, "Polymath" for 50 fields) and chosen
      ("Interview prep", "Toastmasters").
- [ ] Public profile page, opt-in, showing what you choose: best grades,
      fields covered, streak. Private by default.
- [ ] Change the email on an account (with re-confirmation).
- [ ] Custom SMTP (Resend or similar) so confirmation and reset mail is fast and lands in the inbox.

## Friends

- [ ] Send / accept friend requests by `@handle`.
- [ ] A feed of friends' recent takes — topic and grade, transcript only if
      they share it.
- [ ] "Send this topic to a friend" — the same topic lands in their queue.
- [ ] Nudges: "Alex just got an A- on a topic you drew last week."

## Competitions

The reason the grade has to be trustworthy first.

- [ ] **Create a competition.** Pick a topic (or let it draw one), pick the
      level, invite friends, set a window (an hour, a day, a week).
- [ ] Everyone records their minute on the same topic, blind to each other's
      until the window closes.
- [ ] **Leaderboard** by grade, then by fewest fillers as tiebreak; reveal
      transcripts at the close.
- [ ] Head-to-head mode: two people, one topic, sixty seconds each.
- [ ] Series: best of five topics across a week.
- [ ] Brackets for larger groups; a rematch button.
- [ ] Spectator link for people not competing.
- [ ] Fairness: the same rubric version for every entry in a competition,
      graded by the same model, with the host's key or each entrant's key
      (host chooses).

## Classrooms and teams

- [ ] Instructor accounts with a roster; assign a topic or a field to the
      whole class with a deadline.
- [ ] Class view: who has recorded, grade distribution, common filler words.
- [ ] Instructor override of the automated grade with a note.
- [ ] Team mode for companies: onboarding topics, product-knowledge drills.

## Bigger swings

- [ ] **Live coaching** during the minute: a subtle pace indicator and a
      filler-word counter that ticks up in real time (Web Speech API locally,
      no upload until you stop).
- [ ] Follow-up questions: after the grade, the model asks the one question a
      sceptical listener would, and you answer it in thirty seconds.
- [ ] Pick topics from your weak spots: the app notices you avoid Economics
      and starts drawing it more often, if you let it.
- [ ] Longer formats: three-minute and five-minute modes with a different
      rubric.
- [ ] Multi-language: transcribe and grade in the language you spoke.
- [ ] Mobile PWA with offline drawing and notes; sync when back online.
- [ ] Shareable clip: a card with the topic, grade and one quoted line, for
      people who want to post it.
- [ ] Public API so other tools can push topics in and pull grades out.

## Explicitly not planned

- Advertising, analytics, or selling anything about the reader.
- Requiring an account to use the core loop, or a phone number for anything.
- A leaderboard among strangers by default. Competition is opt-in and among
  people you chose.
