import { supabaseAdmin, userFromRequest, json, fail, route } from "@/lib/server/admin";
import { transcribeAudio, analyzeSpeech } from "@/lib/server/openai";
import { computeEntitlement, utcDay, DAILY_CAP } from "@/lib/entitlement";
import { findTopic, LEVEL } from "@/lib/topics";

export const runtime = "nodejs";
export const maxDuration = 60;          // Whisper + grading can take 15–30s
const MAX_BYTES = 4 * 1024 * 1024;      // Vercel's request body limit is 4.5MB; a minute of opus is ~0.5MB
const MAX_SECONDS = 75;

/* POST multipart: audio (file), topic (string), seconds (int).
   Verifies the session, the plan and today's cap, then grades on the
   site's key and stores the result. Order matters: the take is counted
   BEFORE OpenAI is called so parallel requests cannot slip past the cap. */
export const POST = route(async (req) => {
  const user = await userFromRequest(req);
  if (!user) return fail("auth", "Sign in to record.", 401);

  let form;
  try { form = await req.formData(); } catch (e) { return fail("bad_request", "Expected a multipart upload.", 400); }
  const audio = form.get("audio");
  const topicName = String(form.get("topic") || "");
  const seconds = Math.min(MAX_SECONDS, Math.max(1, parseInt(form.get("seconds"), 10) || 60));
  const topic = findTopic(topicName);
  if (!topic) return fail("bad_request", "Unknown topic.", 400);
  if (!audio || typeof audio.arrayBuffer !== "function") return fail("bad_request", "No audio.", 400);
  if (audio.size > MAX_BYTES) return fail("too_large", "That recording is too large to grade.", 413);
  if (audio.size < 2000) return fail("too_short", "That was too short to grade.", 400);
  if (!/^audio\//.test(audio.type || "")) return fail("bad_request", "Not an audio file.", 400);

  const db = supabaseAdmin();
  const [{ data: sub }, { data: usage }] = await Promise.all([
    db.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    db.from("usage").select("*").eq("user_id", user.id).eq("day", utcDay()).maybeSingle(),
  ]);
  const ent = computeEntitlement(sub, usage);
  if (!ent.active) return fail("subscribe", "Recording needs an active trial or subscription.", 402);

  const { data: allowed, error: bumpErr } = await db.rpc("bump_usage", { uid: user.id, cap: DAILY_CAP });
  if (bumpErr) return fail("server", "Could not check today's usage: " + bumpErr.message, 500);
  if (!allowed) return fail("cap", `That's ${DAILY_CAP} graded takes today. The count resets at midnight UTC.`, 429);

  try {
    const ext = /mp4/.test(audio.type) ? "mp4" : /ogg/.test(audio.type) ? "ogg" : "webm";
    const { text, duration, model: transcribeModel } = await transcribeAudio(audio, "speech." + ext);
    if (!text || text.split(/\s+/).length < 5) throw new Error("Almost nothing was heard. Check your microphone and try again.");
    const analysis = await analyzeSpeech({
      transcript: text, topic: topic.t, field: topic.c, level: LEVEL[topic.d],
      durationSeconds: duration || seconds,
    });
    analysis.transcribeModel = transcribeModel;
    const { count } = await db.from("speeches").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("topic", topic.t);
    const { data: row, error } = await db.from("speeches").insert({
      user_id: user.id, topic: topic.t, field: topic.c, difficulty: topic.d,
      transcript: text, analysis, duration_seconds: analysis.durationSeconds, word_count: analysis.wordCount,
      grade: analysis.grade, version: (count || 0) + 1,
    }).select().single();
    if (error) throw new Error("Graded, but saving failed: " + error.message);
    return json({ speech: row, usedToday: ent.usedToday + 1, cap: DAILY_CAP });
  } catch (e) {
    await db.rpc("unbump_usage", { uid: user.id });   // give the take back
    return fail("analysis", e.message || "Analysis failed.", 502);
  }
});
