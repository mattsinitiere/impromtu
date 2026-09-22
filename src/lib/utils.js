export function fmt(s) {
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

export function ago(ts) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

export function shortenDef(x) {
  x = x.replace(/\s+/g, " ").trim();
  const m = x.match(/^[\s\S]{40,}?[.!?](\s|$)/);
  let out = m ? m[0].trim() : x;
  if (out.length < 130) {
    const rest = x.slice(out.length).match(/^[\s\S]*?[.!?](\s|$)/);
    if (rest) out += " " + rest[0].trim();
  }
  return out.length > 330 ? out.slice(0, 327).trim() + "…" : out;
}

export async function wikiSummary(title) {
  const r = await fetch(
    "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title.replace(/ /g, "_")),
    { headers: { accept: "application/json" } }
  );
  if (!r.ok) return null;
  const j = await r.json();
  if (!j.extract || j.type === "disambiguation") return null;
  return {
    t: j.title,
    x: shortenDef(j.extract),
    u: (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) ||
      "https://en.wikipedia.org/wiki/" + encodeURIComponent(j.title),
  };
}

export async function wikiLookup(q) {
  const direct = await wikiSummary(q);
  if (direct) return direct;
  const r = await fetch(
    "https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&origin=*&srsearch=" +
      encodeURIComponent(q)
  );
  if (!r.ok) return null;
  const j = await r.json();
  const hit = j.query && j.query.search && j.query.search[0];
  return hit ? await wikiSummary(hit.title) : null;
}

export function countWords(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

export function gradeClass(g) {
  const l = (g || "").charAt(0).toLowerCase();
  return l === "a" || l === "b" ? "g-a" : l === "c" ? "g-c" : l === "d" ? "g-d" : l === "f" ? "g-f" : "";
}

export function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = 660;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 1.15);
  } catch (e) {}
}

export function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}
