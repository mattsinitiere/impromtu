"use client";
import { fmt, gradeClass } from "@/lib/utils";

const METRICS = [["clarity", "Clarity"], ["structure", "Structure"], ["accuracy", "Accuracy"], ["delivery", "Delivery"]];

/* Renders one speech's analysis. `speech` is a speeches row (or the same
   shape before it is saved): { topic, field, transcript, analysis, version, created_at }.
   `status` = "transcribing" | "grading" | "error" | null for the in-flight states. */
export default function AnalysisPanel({ speech, status, error, onRerecord, onRetry, compact }) {
  if (status === "grading") {
    return (
      <div className="panel analysis">
        <div className="an-load"><span className="spinner" />
          Transcribing and grading your minute… this takes about twenty seconds.</div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="panel analysis">
        <div className="panel-hd"><h3>Analysis failed</h3></div>
        <div className="err">{error}</div>
        <div className="row-actions">
          {onRetry && <button className="btn" onClick={onRetry}>Try the analysis again</button>}
          {onRerecord && <button className="btn btn--ghost" onClick={onRerecord}>Re-record</button>}
        </div>
      </div>
    );
  }
  if (!speech || !speech.analysis) return null;
  const a = speech.analysis;
  const fillers = Object.entries(a.fillers || {}).sort((x, y) => y[1] - x[1]);
  return (
    <div className={"panel analysis" + (compact ? " compact" : "")}>
      <div className="an-top">
        <div className={"grade " + gradeClass(a.grade)}>{a.grade}</div>
        <div className="an-sum">
          <span className="eyebrow">{speech.field}{speech.version > 1 ? " · take " + speech.version : ""}{a.model ? " · " + a.model : ""}</span>
          <h3>{speech.topic}</h3>
          <p>{a.summary}</p>
          <div className="stats">
            <span className="stat"><b>{a.wordCount}</b>words</span>
            <span className="stat"><b>{a.durationSeconds ? fmt(a.durationSeconds) : "—"}</b>length</span>
            <span className="stat"><b>{a.wpm || "—"}</b>wpm</span>
            <span className="stat"><b>{a.fillerTotal}</b>fillers</span>
          </div>
        </div>
      </div>

      <div className="an-grid">
        <div>
          <div className="an-h">Scores</div>
          {METRICS.map(([k, label]) => (
            <div className="metric" key={k}>
              <span>{label}</span>
              <div className="bar"><i style={{ width: (a[k] || 0) * 10 + "%" }} /></div>
              <span>{a[k]}/10</span>
            </div>
          ))}
          <div className="an-h" style={{ marginTop: 18 }}>Filler words</div>
          {fillers.length ? (
            <div className="pills">{fillers.map(([w, n]) => <span className="pill" key={w}>“{w}”<b>×{n}</b></span>)}</div>
          ) : <p className="sub" style={{ margin: 0, fontSize: 13.5 }}>None counted. That is rare — well done.</p>}
        </div>
        <div>
          <div className="an-h">What worked</div>
          <ul className="tips good">{a.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <div className="an-h" style={{ marginTop: 18 }}>To improve</div>
          <ul className="tips">{a.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </div>

      <details className="tr">
        <summary>Transcript</summary>
        <div className="transcript">{speech.transcript}</div>
      </details>

      {onRerecord && (
        <div className="row-actions">
          <button className="btn btn--primary" onClick={onRerecord}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/></svg>
            Record another take
          </button>
        </div>
      )}
    </div>
  );
}
