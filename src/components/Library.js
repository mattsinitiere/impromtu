"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { findTopic } from "@/lib/topics";
import { ago } from "@/lib/utils";

export default function Library({ onPick }) {
  const { S } = useStore();
  const [tab, setTab] = useState("history");
  const list = tab === "history" ? S.history : S.favs;
  return (
    <div className="lib">
      <div className="tabs" role="tablist">
        {[["history", "History"], ["favorites", "Saved"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="rows">
        {!list.length ? (
          <div className="empty">{tab === "history" ? "Nothing drawn yet. Your last sixty topics will collect here." : "Nothing saved. Star a topic to come back to it another day."}</div>
        ) : list.slice(0, 14).map((h, i) => (
          <div className="row" key={h.t + h.at} style={{ animationDelay: i * 22 + "ms" }}>
            <span className="row-t" onClick={() => { const f = findTopic(h.t); if (f) onPick(f); }}>{h.t}</span>
            <span className="eyebrow">{h.c}</span>
            <span className="row-m">{ago(h.at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
