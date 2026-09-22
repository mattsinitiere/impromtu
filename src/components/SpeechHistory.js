"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AnalysisPanel from "./AnalysisPanel";
import { useStore } from "@/lib/store";
import { ago, gradeClass } from "@/lib/utils";

export default function SpeechHistory() {
  const { user, sb, ready, hasAccounts, toast } = useStore();
  const router = useRouter();
  const [rows, setRows] = useState(null);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    if (!user || !sb) { setRows([]); return; }
    sb.from("speeches").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(200)
      .then(({ data, error }) => { if (error) toast(error.message); setRows(data || []); if (data && data[0]) setSel(data[0]); });
  }, [user, sb, toast]);

  async function remove(s) {
    if (!confirm("Delete this take? This cannot be undone.")) return;
    const { error } = await sb.from("speeches").delete().eq("id", s.id);
    if (error) { toast(error.message); return; }
    const next = rows.filter((r) => r.id !== s.id);
    setRows(next); if (sel && sel.id === s.id) setSel(next[0] || null);
  }

  /* per-topic trend: grades in order of version */
  const byTopic = {};
  (rows || []).forEach((r) => { (byTopic[r.topic] = byTopic[r.topic] || []).push(r); });

  if (!ready) return null;
  if (!user) {
    return (
      <section className="wrap page">
        <div className="page-hd"><p className="eyebrow">Speeches</p><h1>Your graded minutes live here.</h1>
          <p>{hasAccounts ? "Sign in to record a speech and see how each take compares with the last." : "Accounts are not configured on this deployment."}</p></div>
        {hasAccounts && <div className="row-actions"><Link className="btn btn--primary" href="/signup">Create account</Link><Link className="btn" href="/login">Log in</Link></div>}
      </section>
    );
  }

  const avg = rows && rows.length ? rows.reduce((a, r) => a + (r.analysis?.fillerTotal || 0), 0) / rows.length : 0;

  return (
    <section className="wrap page">
      <div className="page-hd">
        <p className="eyebrow">Speeches</p>
        <h1>{rows && rows.length ? rows.length + (rows.length === 1 ? " graded minute." : " graded minutes.") : "Nothing recorded yet."}</h1>
        <p>{rows && rows.length ? `Averaging ${avg.toFixed(1)} filler words a take across ${Object.keys(byTopic).length} topics. Click one to read the full report.` : "Draw a topic, prepare, and press Record the minute. The grade lands here."}</p>
      </div>
      {rows === null ? <div className="an-load"><span className="spinner" />Loading…</div> : rows.length === 0 ? (
        <Link className="btn btn--primary" href="/">Draw a topic</Link>
      ) : (
        <div className="sp-layout">
          <div className="panel" style={{ padding: 8 }}>
            {rows.map((r) => {
              const takes = byTopic[r.topic];
              return (
                <div key={r.id} className={"sp-row" + (sel && sel.id === r.id ? " on" : "")} onClick={() => setSel(r)}>
                  <span className={"grade sm " + gradeClass(r.grade)}>{r.grade}</span>
                  <span className="sp-t">{r.topic}
                    <small>{r.field}{takes.length > 1 ? " · take " + r.version + " of " + takes.length : ""}</small></span>
                  <span className="sp-m">{r.word_count} words<br />{ago(r.created_at)}</span>
                </div>
              );
            })}
          </div>
          <div>
            {sel && (<>
              {byTopic[sel.topic].length > 1 && (
                <div className="panel" style={{ marginBottom: 14 }}>
                  <div className="an-h">Takes on this topic</div>
                  <div className="trend">
                    {byTopic[sel.topic].slice().sort((a, b) => a.version - b.version).map((t, i) => (
                      <span key={t.id}>{i > 0 && " → "}<b onClick={() => setSel(t)} style={{ cursor: "pointer" }}>{t.grade}</b></span>
                    ))}
                  </div>
                </div>
              )}
              <AnalysisPanel speech={sel} onRerecord={() => router.push("/?topic=" + encodeURIComponent(sel.topic))} />
              <div className="row-actions"><button className="btn btn--ghost btn--sm" onClick={() => remove(sel)}>Delete this take</button></div>
            </>)}
          </div>
        </div>
      )}
    </section>
  );
}
