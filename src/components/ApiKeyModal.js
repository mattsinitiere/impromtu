"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { looksLikeKey } from "@/lib/openai";

/* Shown the first time a signed-in reader presses Record without a key.
   `onSaved` fires after the key is stored so the caller can carry on. */
export default function ApiKeyModal({ onClose, onSaved }) {
  const { saveApiKey } = useStore();
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    const k = key.trim();
    if (!looksLikeKey(k)) { setErr("That doesn't look like an OpenAI key (they start with sk-)."); return; }
    setBusy(true); setErr("");
    try { await saveApiKey(k); onSaved(k); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>Add your OpenAI key to grade speeches</h3>
        <p>Recording sends the audio to OpenAI for transcription and grading, billed to your own key. It costs about a cent a minute. The key is stored in your account and only ever sent to OpenAI.</p>
        <div className="field">
          <label htmlFor="mk">API key</label>
          <input id="mk" className="input" type="password" autoComplete="off" placeholder="sk-…" value={key} onChange={(e) => setKey(e.target.value)} autoFocus />
          <span className="help">Create one at platform.openai.com → API keys. You can change it later in <Link href="/settings">Settings</Link>.</span>
        </div>
        {err && <div className="err">{err}</div>}
        <div className="acts">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Not now</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Save and record"}</button>
        </div>
      </form>
    </div>
  );
}
