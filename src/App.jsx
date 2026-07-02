import { useState, useMemo } from "react";
import { PROGRAM, TIERS, dayKeyForToday } from "./data.js";
import { useLog } from "./useLog.js";
import RestTimer from "./RestTimer.jsx";

const DAY_KEYS = ["mon", "tue", "thu"];

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function ExerciseRow({ exercise, tier, addEntry, lastFor }) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [logged, setLogged] = useState(false);
  const last = lastFor(exercise.name);

  function submit(e) {
    e.preventDefault();
    if (!weight && !reps) return;
    addEntry({
      exerciseName: exercise.name,
      weight: weight ? Number(weight) : null,
      reps: reps ? Number(reps) : null,
    });
    setLogged(true);
    setTimeout(() => setLogged(false), 1400);
    setWeight("");
    setReps("");
  }

  return (
    <div className="exercise-row" style={tier ? { borderLeftColor: TIERS[tier].color } : undefined}>
      <div className="exercise-info">
        <div className="exercise-name">{exercise.name}</div>
        <div className="exercise-target">{exercise.target}</div>
        {last && (
          <div className="exercise-last">
            Last: {last.weight ? `${last.weight} lb` : ""}{last.weight && last.reps ? " × " : ""}{last.reps ? `${last.reps} reps` : ""} · {fmtDate(last.date)}
          </div>
        )}
      </div>
      <form className="exercise-log" onSubmit={submit}>
        <input
          type="number"
          inputMode="decimal"
          placeholder="lb"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="log-input"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="log-input log-input-small"
        />
        <button type="submit" className={`btn btn-log ${logged ? "btn-log-done" : ""}`}>
          {logged ? "✓" : "Log"}
        </button>
      </form>
    </div>
  );
}

function WorkoutView({ addEntry, lastFor, onOpenTimer }) {
  const today = dayKeyForToday();
  const [dayKey, setDayKey] = useState(today || "tue");
  const day = PROGRAM[dayKey];

  return (
    <div>
      <div className="day-tabs">
        {DAY_KEYS.map((k) => (
          <button
            key={k}
            className={`day-tab ${dayKey === k ? "day-tab-active" : ""} ${today === k ? "day-tab-today" : ""}`}
            onClick={() => setDayKey(k)}
          >
            {PROGRAM[k].short}
            {today === k && <span className="today-dot" />}
          </button>
        ))}
      </div>

      <div className="day-header">
        <div>
          <h2>{day.title}</h2>
          <p className="day-note">{day.note}</p>
        </div>
        <div className="day-duration">{day.duration}</div>
      </div>

      {day.blocks.map((block) => (
        <section key={block.title} className="block">
          <div className="block-header">
            <h3>{block.title}</h3>
            {block.tier && (
              <span className="tier-badge" style={{ background: TIERS[block.tier].color }}>
                {TIERS[block.tier].label}
              </span>
            )}
          </div>
          {block.exercises.map((ex) => (
            <ExerciseRow
              key={ex.name}
              exercise={ex}
              tier={block.tier}
              addEntry={addEntry}
              lastFor={lastFor}
            />
          ))}
        </section>
      ))}

      <button className="fab" onClick={onOpenTimer} aria-label="Open rest timer">
        ⏱
      </button>
    </div>
  );
}

function HistoryView({ entries, removeEntry }) {
  const grouped = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = fmtDate(e.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  if (entries.length === 0) {
    return <p className="empty-state">No sets logged yet. Log a weight and it'll show up here.</p>;
  }

  return (
    <div className="history">
      {grouped.map(([date, items]) => (
        <div key={date} className="history-day">
          <h3 className="history-date">{date}</h3>
          {items.map((e) => (
            <div key={e.id} className="history-row">
              <span className="history-name">{e.exerciseName}</span>
              <span className="history-value">
                {e.weight ? `${e.weight} lb` : ""}{e.weight && e.reps ? " × " : ""}{e.reps ? `${e.reps} reps` : ""}
              </span>
              <button className="history-remove" onClick={() => removeEntry(e.id)} aria-label="Delete entry">
                ×
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const { entries, addEntry, removeEntry, lastFor } = useLog();
  const [tab, setTab] = useState("workout");
  const [timerOpen, setTimerOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <div className="eyebrow">Claire's Program</div>
          <h1>Session Log</h1>
        </div>
        <nav className="tabs">
          <button
            className={`tab ${tab === "workout" ? "tab-active" : ""}`}
            onClick={() => setTab("workout")}
          >
            Workout
          </button>
          <button
            className={`tab ${tab === "history" ? "tab-active" : ""}`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </nav>
      </header>

      <main>
        {tab === "workout" ? (
          <WorkoutView addEntry={addEntry} lastFor={lastFor} onOpenTimer={() => setTimerOpen(true)} />
        ) : (
          <HistoryView entries={entries} removeEntry={removeEntry} />
        )}
      </main>

      <RestTimer open={timerOpen} onClose={() => setTimerOpen(false)} />
    </div>
  );
}
