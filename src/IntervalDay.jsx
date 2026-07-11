import { useState, useEffect, useRef } from "react";

function beep(freq, dur) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {
    // audio unavailable — silent fail
  }
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

const QUOTES = {
  workStart: ["Let's go!", "Here we go!", "Make it count!"],
  work: ["Keep pushing!", "You've got this!", "Strong and steady!", "Stay on it!"],
  workEnd: ["Nearly there!", "Finish strong!", "Almost done!", "Don't fade now!"],
  lastRound: ["Last round!", "Empty the tank!"],
  rest: ["Breathe.", "Shake it out.", "Good work — recover.", "Easy does it."],
};

function pickQuote(bank, previous) {
  let i = Math.floor(Math.random() * bank.length);
  if (bank.length > 1 && bank[i] === previous) i = (i + 1) % bank.length;
  return bank[i];
}

export default function IntervalDay({ protocol, addEntry, lastFor }) {
  const { rounds, workSeconds, restSeconds, modalities } = protocol;
  const [phase, setPhase] = useState("work"); // work | rest
  const [round, setRound] = useState(1);
  const [remaining, setRemaining] = useState(workSeconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [quote, setQuote] = useState(null);
  const intervalRef = useRef(null);

  // A motivational line at the start of each phase and every 30s after,
  // matched to where you are: hype early, "nearly there" late, calm on rest.
  useEffect(() => {
    if (!running || done) return;
    const total = phase === "work" ? workSeconds : restSeconds;
    const elapsed = total - remaining;
    if (remaining <= 10) return; // the pulsing clock takes over here
    if (elapsed !== 2 && (elapsed <= 0 || elapsed % 30 !== 0)) return;

    let bank;
    if (phase === "rest") bank = QUOTES.rest;
    else if (elapsed === 2) bank = round === rounds ? QUOTES.lastRound : QUOTES.workStart;
    else if (remaining <= 45) bank = QUOTES.workEnd;
    else bank = QUOTES.work;

    setQuote((q) => ({ text: pickQuote(bank, q?.text), key: (q?.key ?? 0) + 1 }));
  }, [remaining, running, done, phase, round, rounds, workSeconds, restSeconds]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;

        if (phase === "work") {
          beep(880, 0.4);
          setPhase("rest");
          return restSeconds;
        }
        if (round >= rounds) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          beep(1200, 1);
          return 0;
        }
        beep(660, 0.4);
        setRound((rd) => rd + 1);
        setPhase("work");
        return workSeconds;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phase, round, rounds, workSeconds, restSeconds]);

  function toggle() {
    setRunning((r) => !r);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(false);
    setQuote(null);
    setPhase("work");
    setRound(1);
    setRemaining(workSeconds);
  }

  const total = phase === "work" ? workSeconds : restSeconds;
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  const [modality, setModality] = useState(modalities[0]);
  const [customModality, setCustomModality] = useState("");
  const [rpe, setRpe] = useState("");
  const [notes, setNotes] = useState("");
  const [logged, setLogged] = useState(false);
  const last = lastFor("VO2Max 4x4");

  function submitLog(e) {
    e.preventDefault();
    const modalityLabel = modality === "Other" && customModality ? customModality : modality;
    addEntry({
      exerciseName: "VO2Max 4x4",
      modality: modalityLabel,
      rpe: rpe ? Number(rpe) : null,
      notes: notes || null,
    });
    setLogged(true);
    setTimeout(() => setLogged(false), 1400);
  }

  return (
    <div className="interval-day">
      <div className="interval-status">
        Round {round} of {rounds} · {phase === "work" ? "Work" : "Rest"}
      </div>
      <div className="timer-ring-wrap">
        <svg viewBox="0 0 120 120" className="timer-ring">
          <circle cx="60" cy="60" r={r} className="timer-ring-track" />
          <circle
            cx="60"
            cy="60"
            r={r}
            className={`timer-ring-progress ${phase === "rest" ? "timer-ring-rest" : ""}`}
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          />
        </svg>
        <div
          className={`timer-time ${running && !done && remaining <= 10 ? "timer-time-pulse" : ""}`}
        >
          {done ? "Done" : `${mm}:${ss}`}
        </div>
        {quote && running && !done && (
          <div key={quote.key} className="interval-quote" aria-hidden="true">
            {quote.text}
          </div>
        )}
      </div>
      <div className="timer-controls">
        <button className="btn btn-ghost" onClick={reset}>Reset</button>
        <button className="btn btn-primary" onClick={toggle} disabled={done}>
          {running ? "Pause" : "Start"}
        </button>
      </div>

      <form className="interval-log" onSubmit={submitLog}>
        <div className="interval-log-row">
          <select className="log-select" value={modality} onChange={(e) => setModality(e.target.value)}>
            {modalities.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {modality === "Other" && (
            <input
              className="log-input interval-modality-input"
              placeholder="modality"
              value={customModality}
              onChange={(e) => setCustomModality(e.target.value)}
            />
          )}
          <input
            className="log-input log-input-small"
            type="number"
            inputMode="numeric"
            placeholder="RPE"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
          />
        </div>
        <input
          className="log-input interval-notes"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button type="submit" className={`btn btn-log interval-log-btn ${logged ? "btn-log-done" : ""}`}>
          {logged ? "✓ Logged" : "Log session"}
        </button>
      </form>

      {last && (
        <div className="exercise-last interval-last">
          Last: {last.modality}{last.rpe ? ` · RPE ${last.rpe}` : ""} · {fmtDate(last.date)}
        </div>
      )}
    </div>
  );
}
