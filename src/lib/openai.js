/* Direct browser → OpenAI calls with the reader's own key.
   Nothing here touches our server: the key and the audio go to OpenAI only. */

const API = "https://api.openai.com/v1";

const FILLERS = ["um", "uh", "er", "ah", "like", "you know", "so", "basically", "actually", "literally", "kind of", "sort of", "i mean", "right", "okay"];

function explain(status, body) {
  if (status === 401) return "OpenAI rejected the API key. Check it in Settings.";
  if (status === 429) return "OpenAI rate limit or no credit on this key. Wait a moment or check your OpenAI billing.";
  if (status === 413) return "The recording was too large to upload.";
  const m = body && body.error && body.error.message;
  return m ? "OpenAI: " + m : "OpenAI request failed (" + status + ").";
}

export async function transcribeAudio(blob, apiKey) {
  const ext = /mp4/.test(blob.type) ? "mp4" : /ogg/.test(blob.type) ? "ogg" : "webm";
  const fd = new FormData();
  fd.append("file", blob, "speech." + ext);
  fd.append("model", "whisper-1");
  fd.append("language", "en");
  fd.append("response_format", "verbose_json");
  // Ask Whisper to keep disfluencies so filler counts mean something.
  fd.append("prompt", "Um, uh, so, like, you know... transcribe every word exactly as spoken, including filler words.");
  const r = await fetch(API + "/audio/transcriptions", {
    method: "POST", headers: { Authorization: "Bearer " + apiKey }, body: fd,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(explain(r.status, j));
  return { text: (j.text || "").trim(), duration: j.duration ? Math.round(j.duration) : null };
}

/* Local, deterministic filler count. The model gets this as ground truth
   so the grade is anchored to something checkable. */
export function countFillers(text) {
  const t = " " + text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ") + " ";
  const out = {};
  let total = 0;
  for (const f of FILLERS) {
    const re = new RegExp("(?<= )" + f.replace(/ /g, "\\s") + "(?= )", "g");
    const n = (t.match(re) || []).length;
    if (n) { out[f] = n; total += n; }
  }
  return { fillers: out, total };
}

const RUBRIC = `You are a strict but fair public-speaking coach grading a ONE-MINUTE impromptu explanation of an assigned topic. The speaker had ~15 minutes to research it and speaks from memory.

Score four dimensions 1-10:
- clarity: could a smart listener with no background follow it? Plain words, defined terms, no rambling.
- structure: opening that says what it is, a middle with an example or mechanism, a close. Penalise trailing off.
- accuracy: is the content correct and on-topic for the assigned topic and level? Penalise vagueness that avoids the actual subject.
- delivery: fluency from the transcript — filler-word density, repeated restarts, sentence fragments, pacing (aim ~120-160 words for a minute).

Letter grade from the whole picture (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F):
- A range: clear, structured, accurate, few fillers (≤3), lands a real explanation.
- B range: solid explanation with some fillers (4-8) or a weak close/opening.
- C range: gets the gist but rambles, thin on content, or 9-14 fillers.
- D range: mostly filler, off-topic, or under ~50 words of real content.
- F: nothing substantive was said.
Be honest. Most first attempts are B- to C+. Reserve A+ for genuinely excellent.

Return ONLY JSON with this exact shape:
{"grade":"B+","clarity":7,"structure":6,"accuracy":8,"delivery":7,"summary":"one sentence overall verdict","strengths":["...","..."],"improvements":["specific actionable pointer","...","..."]}
Give 2-3 strengths and 3-4 improvements. Improvements must be specific to THIS transcript (quote a phrase where useful), not generic advice.`;

export const GRADING_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini", note: "Cheapest — a fraction of a cent per grade. Fair, but can wobble at the B/C line." },
  { id: "gpt-4o", label: "GPT-4o", note: "About 15× the grading cost (still only a few cents). Noticeably more consistent and specific." },
];
export const DEFAULT_MODEL = GRADING_MODELS[0].id;

export async function analyzeSpeech({ transcript, topic, field, level, durationSeconds, apiKey, model }) {
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const { fillers, total } = countFillers(transcript);
  const facts = `Topic: ${topic}\nField: ${field}\nLevel: ${level}\nDuration: ${durationSeconds ?? "~60"} seconds\nWord count: ${words}\nFiller words (counted programmatically): ${total}${total ? " — " + Object.entries(fillers).map(([k, v]) => `${k}×${v}`).join(", ") : ""}\n\nTranscript:\n"""${transcript}"""`;
  const r = await fetch(API + "/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GRADING_MODELS.some((m) => m.id === model) ? model : DEFAULT_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: RUBRIC }, { role: "user", content: facts }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(explain(r.status, j));
  let parsed;
  try { parsed = JSON.parse(j.choices[0].message.content); } catch (e) { throw new Error("The analysis came back malformed. Try again."); }
  const clamp = (n) => Math.max(1, Math.min(10, Math.round(Number(n) || 0)));
  return {
    grade: String(parsed.grade || "C").toUpperCase().slice(0, 2),
    clarity: clamp(parsed.clarity), structure: clamp(parsed.structure),
    accuracy: clamp(parsed.accuracy), delivery: clamp(parsed.delivery),
    summary: parsed.summary || "",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
    wordCount: words,
    fillerTotal: total,
    fillers,
    durationSeconds: durationSeconds ?? null,
    wpm: durationSeconds ? Math.round(words / durationSeconds * 60) : null,
    model: j.model || model,
  };
}

export function looksLikeKey(k) { return /^sk-[A-Za-z0-9_-]{20,}$/.test((k || "").trim()); }
