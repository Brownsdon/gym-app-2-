import { useState, useEffect, useRef } from "react";
import { REST_PRESETS } from "./data.js";

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // audio unavailable — silent fail
  }
}

export default function RestTimer({ open, onClose }) {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            beep();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // When the countdown ends: flash red, fade out, and put the phone back on
  // the workout screen without needing a touch.
  useEffect(() => {
    if (!finished || !open) return;
    const t = setTimeout(() => {
      setFinished(false);
      setRemaining(duration);
      onClose();
    }, 5000);
    return () => clearTimeout(t);
  }, [finished, open, duration, onClose]);

  // Reopening after a manual close mid-fade starts clean.
  useEffect(() => {
    if (open) setFinished(false);
  }, [open]);

  function pick(sec) {
    setDuration(sec);
    setRemaining(sec);
    setRunning(false);
    setFinished(false);
  }

  function toggle() {
    setFinished(false);
    if (remaining === 0) {
      setRemaining(duration);
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setRemaining(duration);
  }

  if (!open) return null;

  const pct = duration > 0 ? (remaining / duration) * 100 : 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className={`timer-overlay ${finished ? "timer-overlay-finished" : ""}`} onClick={onClose}>
      <div
        className={`timer-card ${finished ? "timer-card-finished" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="timer-close" onClick={onClose} aria-label="Close rest timer">
          ×
        </button>
        <div className="timer-ring-wrap">
          <svg viewBox="0 0 120 120" className="timer-ring">
            <circle cx="60" cy="60" r={r} className="timer-ring-track" />
            <circle
              cx="60"
              cy="60"
              r={r}
              className={`timer-ring-progress ${finished ? "timer-ring-finished" : ""}`}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: finished ? 0 : offset,
              }}
            />
          </svg>
          <div className={`timer-time ${finished ? "timer-time-finished" : ""}`}>
            {finished ? "Go!" : `${mm}:${ss}`}
          </div>
        </div>
        <div className="timer-presets">
          {REST_PRESETS.map((p) => (
            <button
              key={p}
              className={`chip ${duration === p ? "chip-active" : ""}`}
              onClick={() => pick(p)}
            >
              {p}s
            </button>
          ))}
        </div>
        <div className="timer-controls">
          <button className="btn btn-ghost" onClick={reset}>Reset</button>
          <button className="btn btn-primary" onClick={toggle}>
            {running ? "Pause" : remaining === 0 ? "Restart" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
