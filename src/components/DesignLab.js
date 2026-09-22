"use client";

import { useEffect, useState } from "react";

const TOPICS = [
  { title: "Why do cities need public libraries?", field: "CIVICS", level: "BEGINNER", prompt: "Make the case for a place that gives everyone access to knowledge." },
  { title: "How does a city shape the way strangers meet?", field: "URBAN DESIGN", level: "INTERMEDIATE", prompt: "Explain one design choice that changes how people share public space." },
  { title: "Can a language shape what we remember?", field: "LINGUISTICS", level: "ADVANCED", prompt: "Describe how the words we use may influence the way we organise ideas." },
];

const STEPS = ["Get a topic", "Prepare", "Speak", "Review"];

function Icon({ name, size = 18 }) {
  const paths = {
    sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    back: <><path d="m15 18-6-6 6-6"/><path d="M9 12h11"/></>,
    refresh: <><path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 1-2-5l3 5"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function DotField({ children, onMove }) {
  return <div className="dl-dotfield" onPointerMove={onMove}>{children}</div>;
}

export default function DesignLab() {
  const [design, setDesign] = useState("vercel");
  const [step, setStep] = useState(0);
  const [topicIndex, setTopicIndex] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [checks, setChecks] = useState([false, false, false]);
  const [notes, setNotes] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [pointer, setPointer] = useState({ x: "50%", y: "34%" });

  const topic = TOPICS[topicIndex];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => {
      if (s <= 1) { clearInterval(id); setRunning(false); setStep(3); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running]);

  function drawTopic() {
    if (drawing) return;
    setDrawing(true);
    window.setTimeout(() => {
      setTopicIndex((i) => (i + 1) % TOPICS.length);
      setStep(0);
      setChecks([false, false, false]);
      setNotes("");
      setDrawing(false);
    }, 500);
  }

  function handlePointer(e) {
    const r = e.currentTarget.getBoundingClientRect();
    setPointer({ x: `${e.clientX - r.left}px`, y: `${e.clientY - r.top}px` });
  }

  function reset() {
    setStep(0);
    setSeconds(60);
    setRunning(false);
    setChecks([false, false, false]);
    setNotes("");
  }

  const elapsed = `0:${String(seconds).padStart(2, "0")}`;

  const progress = (
    <div className="dl-progress" aria-label="Practice steps">
      {STEPS.map((label, i) => (
        <button key={label} className={`dl-step ${i === step ? "is-current" : ""} ${i < step ? "is-done" : ""}`} onClick={() => i <= step && setStep(i)} aria-current={i === step ? "step" : undefined} disabled={i > step}>
          <span className="dl-step-dot">{i < step ? <Icon name="check" size={13} /> : `0${i + 1}`}</span><span>{label}</span>
        </button>
      ))}
    </div>
  );

  const topicCard = (
    <section className="dl-card dl-topic-card" aria-labelledby="topic-title">
      <div className="dl-topic-top"><div className="dl-eyebrow"><span className="dl-live-dot" /> TODAY’S PRACTICE</div><span className="dl-topic-level">{topic.level}</span></div>
      <div className="dl-topic-meta">{topic.field}<span>·</span> 1 minute</div>
      <h2 id="topic-title" className={drawing ? "dl-drawing" : ""}>{drawing ? "Finding your next topic…" : topic.title}</h2>
      <p className="dl-prompt">{topic.prompt}</p>
      <div className="dl-topic-actions">
        <button className="dl-button dl-primary" onClick={() => step === 0 ? setStep(1) : setStep(Math.min(step + 1, 3))}>
          {step === 0 ? "Start this practice" : step === 1 ? "I’m ready to speak" : step === 2 ? "Finish practice" : "Practice another topic"}<Icon name="arrow" size={16} />
        </button>
        <button className="dl-button dl-quiet" onClick={drawTopic} disabled={drawing}><Icon name="refresh" size={16} /> Draw another</button>
      </div>
    </section>
  );

  const prep = (
    <section className="dl-card dl-prep-card">
      <div className="dl-section-head"><div><div className="dl-eyebrow">YOUR WORKSPACE</div><h3>{step === 0 ? "A small plan makes a better minute." : step === 1 ? "Get your explanation ready." : step === 2 ? "You’ve got this." : "A strong first take."}</h3></div><span className="dl-time-pill"><Icon name="clock" size={14} /> 15 min prep</span></div>
      {step < 2 ? <>
        <label className="dl-label" htmlFor="dl-notes">Your notes <span>Private to you</span></label>
        <textarea id="dl-notes" className="dl-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write it as if you were explaining it to a friend…" />
        <div className="dl-word-count">{notes.trim() ? notes.trim().split(/\s+/).length : 0} words <span>·</span> Your notes stay here while you practise</div>
        <div className="dl-checklist-head"><span className="dl-label">A quick research check</span><span>{checks.filter(Boolean).length} of 3</span></div>
        <div className="dl-checklist">
          {["I can explain the main idea", "I have one useful example", "I know what I’m still unsure about"].map((label, i) => <label key={label} className="dl-check-row"><input type="checkbox" checked={checks[i]} onChange={(e) => setChecks((v) => v.map((x, j) => j === i ? e.target.checked : x))} /><span className="dl-checkmark"><Icon name="check" size={13} /></span>{label}</label>)}
        </div>
        <div className="dl-prep-footer"><span>Notes close before recording.</span><button onClick={() => setStep(2)} className="dl-text-button">Go to speaking <Icon name="arrow" size={15} /></button></div>
      </> : step === 2 ? <div className="dl-speak-panel"><div className="dl-timer-ring"><span>{elapsed}</span><small>ONE MINUTE</small></div><p>Explain the topic in your own words. Your notes are tucked away for this part.</p><button className={`dl-button ${running ? "dl-stop" : "dl-primary"}`} onClick={() => { if (running) { setRunning(false); setStep(3); } else { setSeconds(60); setRunning(true); } }}><Icon name={running ? "check" : "mic"} size={16} />{running ? "Finish speaking" : "Start the minute"}</button></div> : <div className="dl-score-preview"><div className="dl-grade">A−</div><div><span className="dl-score-caption">SAMPLE FEEDBACK</span><h4>Your point came through.</h4><p>Clear structure; add one specific example to make the idea stick.</p></div><div className="dl-score-grid"><span>Clarity <b>8/10</b></span><span>Structure <b>7/10</b></span><span>Accuracy <b>8/10</b></span><span>Delivery <b>7/10</b></span></div><button onClick={reset} className="dl-text-button"><Icon name="refresh" size={15} /> Try the flow again</button></div>}
    </section>
  );

  const overview = <section className="dl-overview"><div><span className="dl-eyebrow">YOUR PRACTICE</span><h1>Say something<br /><em>worth hearing.</em></h1><p>Explore a new idea, make sense of it, and explain it in one minute.</p></div><div className="dl-overview-stats"><div><b>15</b><span>MINUTES TO PREP</span></div><div><b>01</b><span>MINUTE TO SPEAK</span></div><div><b>03</b><span>TAKES TODAY</span></div></div></section>;

  return (
    <div className={`dl-lab dl-${design}`} style={{ "--dl-mx": pointer.x, "--dl-my": pointer.y }}>
      <div className="dl-sample-switcher" role="group" aria-label="Choose a design sample">
        <span className="dl-switch-label">DESIGN SAMPLES</span>
        <button className={design === "vercel" ? "active" : ""} onClick={() => setDesign("vercel")}>01 <span>Vercel × Mobbin</span></button>
        <button className={design === "ramp" ? "active" : ""} onClick={() => setDesign("ramp")}>02 <span>Ramp</span></button>
        <span className="dl-preview-note">Responsive prototypes · no account needed</span>
      </div>

      {design === "vercel" ? <DotField onMove={handlePointer}>
        <div className="dl-vercel-top"><a className="dl-logo" href="#top"><span className="dl-logo-mark">i.</span> Impromptu</a><div className="dl-top-links"><span>Practice</span><span>My progress</span><button aria-label="Open menu">···</button></div><div className="dl-top-user">M</div></div>
        <div className="dl-vercel-body" id="top">
          {overview}
          {progress}
          <div className="dl-main-grid"><div>{topicCard}{step < 3 && prep}</div><aside className="dl-side-panel"><div className="dl-eyebrow">SESSION GUIDE</div><div className="dl-guide-row"><span>01</span><div><b>Draw a topic</b><small>Start with a surprise</small></div></div><div className="dl-guide-row"><span>02</span><div><b>Research + prepare</b><small>Build your explanation</small></div></div><div className="dl-guide-row"><span>03</span><div><b>Speak for one minute</b><small>Leave the notes behind</small></div></div><div className="dl-guide-tip"><Icon name="book" size={16} /><span>Curiosity first. Perfection can wait.</span></div></aside></div>
          <div className="dl-footnote"><span>Made for curious minds.</span><span>Guest mode · notes stay on this device</span></div>
        </div>
      </DotField> : <div className="dl-ramp-shell" onPointerMove={handlePointer}>
        <aside className="dl-ramp-rail"><a className="dl-logo" href="#top"><span className="dl-logo-mark">i.</span> Impromptu</a><div className="dl-rail-label">WORKSPACE</div><button className="dl-rail-item selected"><span>◉</span> Practice</button><button className="dl-rail-item"><span>▤</span> My activity</button><button className="dl-rail-item"><span>☆</span> Saved topics</button><button className="dl-rail-item"><span>⌘</span> Explore fields</button><div className="dl-rail-bottom"><span className="dl-avatar">M</span><span>Matthew<small>Free beta</small></span><button aria-label="Account options">···</button></div></aside>
        <div className="dl-ramp-main" id="top"><div className="dl-ramp-header"><div><span className="dl-eyebrow">MONDAY, 22 SEPTEMBER</span><h1>Good afternoon, Matthew</h1></div><div className="dl-week-pill"><span /> Weekly goal <b>2 / 4 days</b></div></div>
          <div className="dl-ramp-stats"><div className="dl-stat-card"><span>THIS WEEK</span><b>02 <small>sessions</small></b><i>↗ 1 more than last week</i></div><div className="dl-stat-card"><span>BEST RECENT GRADE</span><b>A−</b><i>Last practice · yesterday</i></div><div className="dl-stat-card"><span>TOPIC FIELDS</span><b>08</b><i>Keep exploring</i></div></div>
          <div className="dl-ramp-work"><div className="dl-ramp-intro"><div><span className="dl-eyebrow">NEXT UP</span><h2>Build a stronger point of view.</h2><p>One topic. A little research. One minute to explain what you learned.</p></div><span className="dl-round-mark"><Icon name="sparkle" size={20} /></span></div>{progress}<div className="dl-main-grid"><div>{topicCard}{step < 3 && prep}</div><aside className="dl-side-panel"><div className="dl-eyebrow">YOUR PRACTICE PLAN</div><div className="dl-plan-counter"><b>{checks.filter(Boolean).length}<small> / 3</small></b><span>prep checks done</span></div><div className="dl-guide-row"><span>↗</span><div><b>Start with the main idea</b><small>What should someone remember?</small></div></div><div className="dl-guide-row"><span>↗</span><div><b>Add one example</b><small>Make the idea concrete</small></div></div><div className="dl-guide-tip"><Icon name="mic" size={16} /><span>Your notes hide while you speak.</span></div></aside></div></div>
          <div className="dl-footnote"><span>Practice at your own pace.</span><span>Sample data · guest mode</span></div>
        </div>
      </div>}
    </div>
  );
}
