"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import TopicCard from "./TopicCard";
import Workspace from "./Workspace";
import Library from "./Library";
import AnalysisPanel from "./AnalysisPanel";
import SubscribeModal from "./SubscribeModal";
import { CATS, dailyTopic, findTopic, pickTopic, poolFor } from "@/lib/topics";
import { useStore } from "@/lib/store";
import { useTimer } from "@/hooks/useTimer";
import { useRecorder } from "@/hooks/useRecorder";
import { chime, wikiLookup } from "@/lib/utils";
import { DAILY_CAP } from "@/lib/entitlement";

export default function HomeApp() {
  const { S, update, ready, user, plan, refreshPlan, api, hasAccounts, toast, setTheme } = useStore();
  const router = useRouter();
  const params = useSearchParams();

  const [current, setCurrent] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [spinTitle, setSpinTitle] = useState("");
  const [spinLit, setSpinLit] = useState(new Set());
  const [drawCount, setDrawCount] = useState(0);
  const [def, setDef] = useState({ loading: false, data: null });
  const [revealKey, setRevealKey] = useState(0);
  const [flash, setFlash] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);

  /* recording + analysis */
  const recorder = useRecorder();
  const [status, setStatus] = useState(null);      // grading | error | null
  const [anError, setAnError] = useState("");
  const [result, setResult] = useState(null);      // saved speech row
  const [signinModal, setSigninModal] = useState(false);
  const [subModal, setSubModal] = useState(false);
  const lastBlob = useRef(null);
  const cardRef = useRef(null);
  const workRef = useRef(null);
  const defToken = useRef(0);
  const currentRef = useRef(null); currentRef.current = current;
  const sRef = useRef(S); sRef.current = S;   // latest state for callbacks fired from timeouts

  const daily = dailyTopic();

  /* ---------- timer ---------- */
  const onTimeUp = useCallback(() => {
    chime();
    if (recorder.recording) finishRecording();
    else toast("Time. Note down what you skipped while it is fresh.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.recording]);
  const timer = useTimer(onTimeUp);

  /* ---------- definition ---------- */
  const loadDef = useCallback(async (term) => {
    const mine = ++defToken.current;
    if (S.defs && S.defs[term]) { setDef({ loading: false, data: S.defs[term] }); return; }
    setDef({ loading: true, data: null });
    let found = null;
    try { found = await wikiLookup(term); } catch (e) {}
    if (mine !== defToken.current) return;
    if (found) update((p) => ({ defs: Object.assign({}, p.defs, { [term]: found }) }));
    setDef({ loading: false, data: found });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S.defs]);

  /* ---------- set / draw ---------- */
  const land = useCallback((t, { animate } = {}) => {
    setCurrent(t);
    setRevealKey((k) => k + 1);
    setResult(null); setStatus(null); setAnError("");
    recorder.cancel();
    timer.reset();
    setWorkOpen(true);
    loadDef(t.t);
    if (animate) { setFlash(true); setTimeout(() => setFlash(false), 950); }
    update((p) => ({ history: [{ t: t.t, c: t.c, d: t.d, at: Date.now() }].concat(p.history.filter((h) => h.t !== t.t)).slice(0, 60) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDef, timer.reset]);

  const setTopic = useCallback((t) => {
    land(t);
    setTimeout(() => cardRef.current && cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }, [land]);

  const draw = useCallback(() => {
    if (drawing || recorder.recording) return;
    const { history, diff, cats } = sRef.current;
    const recent = history.slice(0, 12).map((h) => h.t);
    const next = pickTopic(diff, cats, recent);
    if (!next) { toast("No topics match those filters. Widen the field or level."); return; }
    setDrawing(true); setCurrent(null); setDef({ loading: false, data: null }); defToken.current++;
    const p = poolFor(diff, cats);
    const brief = p.filter((x) => x.t.length < 26);
    const reel = brief.length > 8 ? brief : p;
    let head = 0;
    const iv = setInterval(() => {
      setSpinTitle(reel[Math.floor(Math.random() * reel.length)].t);
      const s = new Set(); for (let k = 0; k < 9; k++) s.add((head + k) % 60);
      setSpinLit(s); head = (head + 3) % 60;
    }, 55);
    setTimeout(() => {
      clearInterval(iv);
      setDrawing(false);
      setDrawCount((c) => c + 1);
      land(next, { animate: true });
    }, 1150);
  }, [drawing, recorder.recording, toast, land]);

  /* ---------- deep links: /?topic=… (re-record) and /?field=… (category page) ---------- */
  useEffect(() => {
    if (!ready) return;
    const t = params.get("topic"), f = params.get("field");
    if (t) { const found = findTopic(t); if (found) { setTopic(found); router.replace("/", { scroll: false }); } }
    else if (f && CATS.some((c) => c.name === f)) {
      update({ cats: [f], diff: 0 });
      router.replace("/", { scroll: false });
      setTimeout(() => { cardRef.current && cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" }); }, 50);
      setTimeout(draw, 420);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* ---------- fav / copy ---------- */
  const isFav = !!current && S.favs.some((f) => f.t === current.t);
  function toggleFav() {
    if (!current) return;
    if (isFav) { update((p) => ({ favs: p.favs.filter((f) => f.t !== current.t) })); toast("Removed from saved"); }
    else { update((p) => ({ favs: [{ t: current.t, c: current.c, d: current.d, at: Date.now() }].concat(p.favs).slice(0, 80) })); toast("Saved to your list"); }
  }
  function copyTopic() {
    if (!current) return;
    const txt = current.t;
    const ok = () => toast("Copied “" + txt + "”");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, () => toast("Copy blocked here — select the title instead."));
    else toast("Copy blocked here — select the title instead.");
  }

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const f = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "g") { e.preventDefault(); draw(); }
      else if (k === "f" && currentRef.current) toggleFav();
      else if (k === "c" && currentRef.current) copyTopic();
      else if (k === "t") setTheme(S.theme === "dark" ? "light" : "dark");
    };
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  });

  /* ---------- recording pipeline ---------- */
  async function startRecording() {
    if (!current) return;
    if (!hasAccounts || !user) { setSigninModal(true); return; }
    if (!plan.active) { setSubModal(true); return; }
    if (plan.remaining <= 0) { toast(`That's ${DAILY_CAP} graded takes today. The count resets at midnight UTC.`); return; }
    try {
      timer.reset();
      await recorder.start();
      timer.start();
      setResult(null); setStatus(null);
      toast("Recording. The minute has started.");
    } catch (e) { toast(e.message); }
  }

  async function finishRecording() {
    timer.pause();
    const { blob, seconds } = await recorder.stop();
    lastBlob.current = { blob, seconds, topic: currentRef.current };
    if (seconds < 5 || blob.size < 2000) { toast("That was too short to grade. Try again."); timer.reset(); return; }
    setTimeout(() => workRef.current && workRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    await runAnalysis();
  }

  async function runAnalysis() {
    const job = lastBlob.current;
    if (!job) return;
    try {
      setStatus("grading"); setAnError("");
      const fd = new FormData();
      fd.append("audio", job.blob, "speech");
      fd.append("topic", job.topic.t);
      fd.append("seconds", String(job.seconds));
      const { speech } = await api("/api/analyze", { form: fd });
      setResult(speech); setStatus(null);
      refreshPlan();
      toast("Graded: " + speech.grade);
    } catch (e) {
      setStatus(null);
      if (e.code === "subscribe") { setSubModal(true); refreshPlan(); return; }
      if (e.code === "auth") { setSigninModal(true); return; }
      setStatus("error"); setAnError(e.message);
      if (e.code === "cap") refreshPlan();
    }
  }

  function rerecord() { setResult(null); setStatus(null); timer.reset(); startRecording(); }

  const busy = status === "grading";

  return (
    <>
      <section className="wrap hero">
        <p className="eyebrow rise">One topic · Sixty seconds · One grade</p>
        <h1 className="rise" style={{ animationDelay: ".06s" }}>Learn anything.<br />Speak about <em>everything</em>.</h1>
        <p className="rise" style={{ animationDelay: ".12s" }}>Impromptu draws a topic you didn't choose. You research it, write the explanation in your own words, and then talk about it for a minute — out loud, no notes. Record the minute and it comes back graded, with the filler words counted and three things to fix next time.</p>
        <div className="hero-cta rise" style={{ animationDelay: ".18s" }}>
          <button className="btn btn--primary btn--lg" onClick={() => { cardRef.current && cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(draw, 380); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v4M3 5h4M6 17v4M4 19h4"/><path d="M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z"/></svg>
            Draw a topic
          </button>
          <Link className="btn btn--lg" href="/how">How it works</Link>
        </div>
      </section>

      <section className="wrap stage">
        <div className="daily">
          <span className="eyebrow">Today</span>
          <b>{daily.t}</b>
          <button className="btn btn--sm" onClick={() => setTopic(daily)}>Take today's topic</button>
        </div>

        <TopicCard current={current} drawing={drawing} spinTitle={spinTitle} spinLit={spinLit} drawCount={drawCount}
          timer={timer} def={def} isFav={isFav} onDraw={draw} onCopy={copyTopic} onFav={toggleFav}
          cardRef={cardRef} revealKey={revealKey} flash={flash} recording={recorder.recording} />

        <div ref={workRef}>
          <Workspace current={current} open={workOpen && !!current} timer={timer} recording={recorder.recording} busy={busy}
            plan={user ? plan : null}
            onStartTimer={() => (timer.running ? timer.pause() : (timer.finished && timer.reset(), timer.start()))}
            onRecord={startRecording} onStopRecording={finishRecording}
            onReset={() => { timer.reset(); }} />
          {current && (status || result) && (
            <AnalysisPanel speech={result} status={status} error={anError} onRerecord={rerecord} onRetry={runAnalysis} />
          )}
        </div>

        <Library onPick={setTopic} />
      </section>

      {subModal && <SubscribeModal onClose={() => setSubModal(false)} />}
      {signinModal && (
        <div className="modal-bg" onClick={() => setSigninModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create an account to record</h3>
            <p>{hasAccounts ? "Graded speeches are saved to your account so you can watch them improve. It takes an email, a username and a password, and it is free while Impromptu is in beta. Drawing topics and running the clock work without one." : "This deployment has no account backend configured, so recording is unavailable."}</p>
            <div className="acts">
              <button className="btn btn--ghost" onClick={() => setSigninModal(false)}>Not now</button>
              {hasAccounts && <Link className="btn" href="/login">Log in</Link>}
              {hasAccounts && <Link className="btn btn--primary" href="/signup">Sign up</Link>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
