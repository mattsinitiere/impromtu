# Impromptu

Draw a topic you didn't choose. Research it, write it in your own words, present it for one minute.

Built by Matthew Sinitiere.

**v1.0.0** — one HTML file, no build step, no dependencies, no tracking.

---

## Run it

Double-click `index.html`. That's the whole install.

To serve it locally (needed if you want the favicon and font requests to behave exactly as they will in production):

```bash
python3 -m http.server 8000
# -> http://localhost:8000
```

## Deploy it

Any static host. Drop the folder in and you're done.

```bash
npx vercel deploy --prod     # Vercel
npx netlify deploy --prod    # Netlify
```

GitHub Pages: push the folder to a repo, then Settings -> Pages -> deploy from branch root.

## What's in the box

```
index.html      the entire application - markup, styles, logic, topic corpus
favicon.svg     wordmark favicon
robots.txt      crawler policy (add your sitemap once the domain is live)
README.md       this file
CHANGELOG.md    release notes
LICENSE         MIT
.editorconfig   two-space indents, LF, UTF-8
.gitignore      OS, editor and host artefacts
```

There is no `package.json` and no toolchain. Nothing here compiles, bundles or
installs — what you edit is what ships.

## The topic corpus

617 topics across 61 fields, each tagged `1` beginner, `2` intermediate, `3` advanced.

Find `const RAW = [` in `index.html`. The format is one string per field:

```
"Field Name|Topic One~1|Topic Two~3|Topic Three~2"
```

To add a field, add a string. To add topics, append to an existing one. Everything downstream — the category picker, the counts on the Categories page, the daily topic, the filters — reads from this array, so nothing else needs touching.

Two rules that keep the pool worth drawing from:

- **No `&`, `<` or `>` characters.** Topic names are written into the DOM as HTML.
- **Timeless only.** If it won't be worth understanding in ten years, it doesn't belong. No news, no celebrities, no trivia.

## Storage and theme

State (theme, filters, history, saved topics, notes, checklists) lives in `localStorage` under the key `impromptu:v1`. Nothing is sent anywhere; there is no backend, no account, no analytics.

Light mode is the default on a first visit. The site deliberately does not follow the operating system setting — if the reader picks dark, that choice sticks from then on.

If you want state to sync across devices, replace the `store` object near the top of the script. It exposes only `get(key)` and `set(key, value)`, both async, so swapping in a call to your own API is a contained change.

## Keyboard

| Key | Action |
|-----|--------|
| `G` | Draw a topic |
| `F` | Save / unsave the current topic |
| `C` | Copy the current topic |
| `T` | Toggle light and dark |
| `Esc` | Close the field picker |

Shortcuts are suppressed while you're typing in the notes field.

## Type

The wordmark and headings are Inter; the dial, labels and counters are JetBrains Mono. Both load from Google Fonts.

If you'd rather not depend on that — for privacy, or for offline use — delete the three `<link>` tags in `<head>`. The stack falls back to SF Pro on macOS and Segoe UI Variable on Windows, which is a small visual change, not a broken one. To self-host instead, drop the woff2 files in a `fonts/` folder and add `@font-face` rules at the top of the `<style>` block.

## Licence

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Matthew Sinitiere.
