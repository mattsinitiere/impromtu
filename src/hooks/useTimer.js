"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/* Sixty-second countdown. `onDone` fires once when it reaches zero. */
export function useTimer(onDone, total = 60) {
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const iv = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const pause = useCallback(() => {
    clearInterval(iv.current); iv.current = null; setRunning(false);
  }, []);

  const start = useCallback(() => {
    if (iv.current) return;
    setRunning(true); setFinished(false);
    iv.current = setInterval(() => {
      setLeft((l) => {
        const n = l - 1;
        if (n <= 0) { clearInterval(iv.current); iv.current = null; setRunning(false); setFinished(true); return 0; }
        return n;
      });
    }, 1000);
  }, []);

  const reset = useCallback(() => { pause(); setLeft(total); setFinished(false); }, [pause, total]);

  useEffect(() => { if (finished && doneRef.current) doneRef.current(); }, [finished]);
  useEffect(() => () => clearInterval(iv.current), []);

  const started = left < total;
  return { left, running, finished, started, start, pause, reset, elapsed: total - left };
}
