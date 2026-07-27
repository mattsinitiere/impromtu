# Changelog

All notable changes to Impromptu are recorded here.
This project follows [Semantic Versioning](https://semver.org/).

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
