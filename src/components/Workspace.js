"use client";
import { ANGLES, CHECKS, hash } from "@/lib/topics";
import { useStore } from "@/lib/store";
import { countWords } from "@/lib/utils";

const Play = <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const Pause = <svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/></svg>;
const Mic = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/></svg>;
const Stop = <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>;

export default function Workspace({ current, open, timer, recording, busy, plan, onStartTimer, onRecord, onStopRecording, onReset }) {
  const { S, update } = useStore();
  const key = current ? current.t : "";
  const seed = hash(key);
  const angles = [0, 1, 2, 3].map((i) => ANGLES[(seed + i * 3) % ANGLES.length]);
  const done = S.checks[key] || [];
  const notes = S.notes[key] || "";
  const w = countWords(notes);
  const secs = Math.round(w / 140 * 60);

  function toggleCheck(i) {
    const arr = done.indexOf(i) > -1 ? done.filter((x) => x !== i) : done.concat(i);
    update({ checks: Object.assign({}, S.checks, { [key]: arr }) });
  }

  const tState = recording ? "Recording" : timer.finished ? "Finished" : timer.running ? "Speaking" : timer.started ? "Paused" : "Ready";
  const startLabel = timer.running ? "Pause" : timer.finished ? "Go again" : timer.started ? "Resume" : "Start the minute";

  return (
    <div className={"work" + (open ? " open" : "")} aria-hidden={!open}>
      <div className="panel">
        <div className="panel-hd">
          <h3>Your explanation</h3>
          <span className="count" style={{ color: secs > 75 ? "var(--accent)" : "" }}>{w} words · ~{secs}s aloud</span>
        </div>
        <textarea value={notes} onChange={(e) => update({ notes: Object.assign({}, S.notes, { [key]: e.target.value }) })}
          placeholder="Write it the way you'd say it to a friend who has never heard of it. If a sentence needs a term you can't define, you don't understand it yet." />
        <div className="panel-hd" style={{ margin: "16px 0 10px" }}><h3>Angles worth covering</h3></div>
        <div className="angles">
          {angles.map((a, i) => <div className="angle" key={i}><i>{i + 1}</i><span>{a}</span></div>)}
        </div>
      </div>
      <div className="panel">
        <div className="panel-hd">
          <h3>Research checklist</h3>
          <button className="btn btn--ghost btn--sm" onClick={() => update({ checks: Object.assign({}, S.checks, { [key]: [] }) })}>Reset</button>
        </div>
        <div className="check">
          {CHECKS.map((c, i) => (
            <label key={i}>
              <input type="checkbox" checked={done.indexOf(i) > -1} onChange={() => toggleCheck(i)} />
              <span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg></span>
              <span>{c}</span>
            </label>
          ))}
        </div>
        <div className="panel-hd" style={{ margin: "18px 0 10px" }}>
          <h3>Presentation timer</h3>
          <span className="count">{plan && plan.active ? `${tState} · ${plan.usedToday}/${plan.cap} today` : tState}</span>
        </div>
        <p className="sub" style={{ margin: 0, fontSize: 13.5 }}>
          {recording ? "Speaking. The minute ends on its own; stop early if you finish." : "Close the notes. Record it to get a grade, or just run the clock."}
        </p>
        <div className="timer-row">
          {recording ? (
            <button className="btn recording" onClick={onStopRecording}><span className="rec-dot" />Stop recording</button>
          ) : (
            <button className="btn btn--primary" onClick={onRecord} disabled={busy || timer.running}>{Mic}{plan && !plan.active ? (plan.status ? "Subscribe to record" : "Record the minute · free trial") : plan && plan.remaining <= 0 ? `Recorded ${plan.cap} today` : timer.finished ? "Record another take" : "Record the minute"}</button>
          )}
          <button className="btn" onClick={onStartTimer} disabled={recording || busy}>{timer.running ? Pause : Play}{startLabel}</button>
          <button className="btn btn--ghost" onClick={onReset} disabled={(!timer.started && !timer.finished) || recording || busy}>{Stop}Reset</button>
        </div>
      </div>
    </div>
  );
}
