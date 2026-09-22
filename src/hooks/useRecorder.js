"use client";
import { useCallback, useRef, useState } from "react";

function pickMime() {
  if (typeof MediaRecorder === "undefined") return null;
  const c = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return c.find((m) => MediaRecorder.isTypeSupported(m)) || "";
}

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const rec = useRef(null);
  const chunks = useRef([]);
  const stream = useRef(null);
  const startedAt = useRef(0);

  const supported = typeof window !== "undefined" && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && typeof MediaRecorder !== "undefined";

  const start = useCallback(async () => {
    if (!supported) throw new Error("This browser can't record audio. Try Chrome, Edge, Safari or Firefox.");
    let s;
    try { s = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) {
      if (e && (e.name === "NotAllowedError" || e.name === "SecurityError")) throw new Error("Microphone access was blocked. Allow it in the address bar and try again.");
      if (e && e.name === "NotFoundError") throw new Error("No microphone found.");
      throw new Error("Couldn't open the microphone: " + (e && e.message));
    }
    stream.current = s;
    chunks.current = [];
    const mime = pickMime();
    const r = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
    r.ondataavailable = (e) => { if (e.data && e.data.size) chunks.current.push(e.data); };
    rec.current = r;
    r.start(250);
    startedAt.current = Date.now();
    setRecording(true);
  }, [supported]);

  /* resolves with { blob, seconds } */
  const stop = useCallback(() => new Promise((resolve) => {
    const r = rec.current;
    const done = () => {
      if (stream.current) { stream.current.getTracks().forEach((t) => t.stop()); stream.current = null; }
      const type = (r && r.mimeType) || "audio/webm";
      const blob = new Blob(chunks.current, { type });
      const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      rec.current = null; chunks.current = [];
      setRecording(false);
      resolve({ blob, seconds });
    };
    if (!r || r.state === "inactive") return done();
    r.onstop = done;
    r.stop();
  }), []);

  const cancel = useCallback(() => {
    const r = rec.current;
    if (r && r.state !== "inactive") { r.onstop = null; r.stop(); }
    if (stream.current) { stream.current.getTracks().forEach((t) => t.stop()); stream.current = null; }
    rec.current = null; chunks.current = [];
    setRecording(false);
  }, []);

  return { recording, supported, start, stop, cancel };
}
