"use client";
import { useMemo } from "react";

/* Sixty ticks, one per second. `lit` is either a number (light 0..n-1) or a
   Set of indices (used by the drawing sweep). */
export default function Dial({ lit, num, lab }) {
  const ticks = useMemo(() => {
    const out = [];
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 - 90) * Math.PI / 180;
      const major = i % 5 === 0;
      const r1 = major ? 34 : 37, r2 = 44;
      out.push({
        i, major,
        x1: (50 + Math.cos(a) * r1).toFixed(2), y1: (50 + Math.sin(a) * r1).toFixed(2),
        x2: (50 + Math.cos(a) * r2).toFixed(2), y2: (50 + Math.sin(a) * r2).toFixed(2),
      });
    }
    return out;
  }, []);
  const isLit = (i) => (lit instanceof Set ? lit.has(i) : i < (lit || 0));
  return (
    <div className="dial">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {ticks.map((t) => (
          <line key={t.i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            className={"tk" + (t.major ? " q" : "") + (isLit(t.i) ? " lit" : "")} />
        ))}
      </svg>
      <div className="dial-face">
        <div className="dial-num">{num}</div>
        <div className="dial-lab">{lab}</div>
      </div>
    </div>
  );
}
