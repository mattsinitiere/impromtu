"use client";
import { useEffect, useRef, useState } from "react";
import Dial from "./Dial";
import { CATS, LEVEL } from "@/lib/topics";
import { useStore } from "@/lib/store";
import { fmt } from "@/lib/utils";

const Icon = {
  spark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  copy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5.5A2.5 2.5 0 0 1 7.5 3H15"/></svg>,
  star: (on) => <svg viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z"/></svg>,
};

export default function TopicCard({ current, drawing, spinTitle, spinLit, drawCount, timer, def, isFav, onDraw, onCopy, onFav, cardRef, revealKey, flash, recording }) {
  const { S, update, toast } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const picker = useRef(null);

  useEffect(() => {
    const f = (e) => { if (picker.current && !picker.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener("click", f);
    const k = (e) => { if (e.key === "Escape") setPickerOpen(false); };
    addEventListener("keydown", k);
    return () => { document.removeEventListener("click", f); removeEventListener("keydown", k); };
  }, []);

  /* dial state */
  let lit, num, lab, note;
  if (drawing) { lit = spinLit; num = "···"; lab = "drawing"; note = "Sixty ticks. One for every second you'll be talking."; }
  else if (timer.finished) { lit = 0; num = "0:00"; lab = "time"; note = "That was a minute. What did you leave out?"; }
  else if (timer.started || timer.running) { lit = timer.left; num = fmt(timer.left); lab = timer.left <= 10 ? "seconds left" : "remaining"; note = recording ? "Recording. Speak as if someone is listening — someone is." : "Keep going. Finishing early is the same skill as finishing late."; }
  else { lit = 0; num = "1:00"; lab = "to speak"; note = "Sixty ticks. One for every second you'll be talking."; }

  const n = S.cats ? S.cats.length : 0;
  const catLabel = !S.cats || n === 0 || n === CATS.length ? "All fields" : n === 1 ? S.cats[0] : n + " fields";

  function toggleCat(name) {
    let cats = S.cats ? S.cats.slice() : CATS.map((c) => c.name);
    const i = cats.indexOf(name);
    if (i > -1) { if (cats.length === 1) { toast("Keep at least one field selected."); return; } cats.splice(i, 1); }
    else cats.push(name);
    update({ cats });
  }

  return (
    <div className={"card" + (current || drawing ? " reveal" : "") + (flash ? " flash" : "")} ref={cardRef} id="card">
      <div className="card-grid">
        <div className="rail">
          <Dial lit={lit} num={num} lab={lab} />
          <p className="rail-note">{note}</p>
        </div>
        <div className="face" key={revealKey}>
          <div className="meta">
            {drawing ? <span className="eyebrow shimmer">Drawing from {CATS.length} fields</span>
              : current ? (<>
                <span className="eyebrow">{current.c}</span><span className="dot" />
                <span className="eyebrow">{LEVEL[current.d]}</span>
                {drawCount > 0 && <><span className="dot" /><span className="eyebrow">Draw {String(drawCount).padStart(2, "0")}</span></>}
              </>) : <span className="eyebrow">Nothing drawn yet</span>}
          </div>
          <h2 className={"topic" + (!current && !drawing ? " ghost" : "") + (drawing ? " spin" : "")} aria-live={drawing ? "off" : "polite"}>
            {drawing ? spinTitle : current ? current.t : "Press draw to begin."}
          </h2>
          {current && !drawing && (
            <div className={"def" + (def.loading ? " load" : "")}>
              <p>{def.loading ? "Looking up a one-line definition to start you off" : def.data ? def.data.x : "No definition loaded. Either you are offline, or this one is filed under a different name — which is itself worth knowing before you present it."}</p>
              <div className="src">
                {!def.loading && (def.data
                  ? <a href={def.data.u} target="_blank" rel="noopener">Wikipedia · {def.data.t}</a>
                  : <a href={"https://en.wikipedia.org/w/index.php?search=" + encodeURIComponent(current.t)} target="_blank" rel="noopener">Look it up</a>)}
              </div>
            </div>
          )}
          <p className="sub">
            {current ? "Research it for fifteen minutes. Write the explanation in your own words. Then say it out loud for a minute."
              : `You will get a real subject from one of ${CATS.length} fields — none disposable. Not trivia. Something worth understanding.`}
          </p>
          <div className="acts">
            <button className="btn btn--primary" onClick={onDraw} disabled={drawing || recording}>{Icon.spark}{current ? "Draw another" : "Draw a topic"}</button>
            {current && !drawing && (<>
              <a className="btn" href={"https://en.wikipedia.org/w/index.php?search=" + encodeURIComponent(current.t)} target="_blank" rel="noopener">{Icon.search}Start research</a>
              <button className="btn" onClick={onCopy}>{Icon.copy}Copy</button>
              <button className={"btn" + (isFav ? " is-on" : "")} onClick={onFav}>{Icon.star(isFav)}{isFav ? "Saved" : "Save"}</button>
            </>)}
          </div>
        </div>
      </div>
      <div className="controls">
        <div className="seg" role="group" aria-label="Difficulty">
          {[[0, "Any level"], [1, "Beginner"], [2, "Intermediate"], [3, "Advanced"]].map(([d, l]) => (
            <button key={d} aria-pressed={S.diff === d} onClick={() => update({ diff: d })}>{l}</button>
          ))}
        </div>
        <div className="picker" ref={picker}>
          <button className="picker-btn" aria-expanded={pickerOpen} onClick={() => setPickerOpen((o) => !o)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
            <span>{catLabel}</span>
          </button>
          <div className={"pop" + (pickerOpen ? " open" : "")} role="dialog" aria-label="Choose fields">
            <div className="pop-hd">
              <span className="eyebrow">Draw from</span>
              <button className="btn btn--ghost btn--sm" onClick={() => update({ cats: null })}>Select all</button>
            </div>
            <div className="cats">
              {CATS.map((c) => {
                const on = !S.cats || S.cats.indexOf(c.name) > -1;
                return <button key={c.name} className="chip" aria-pressed={on} onClick={() => toggleCat(c.name)}>{c.name}</button>;
              })}
            </div>
          </div>
        </div>
        <div className="hint"><kbd>G</kbd> draw <kbd>F</kbd> save <kbd>T</kbd> theme</div>
      </div>
    </div>
  );
}
