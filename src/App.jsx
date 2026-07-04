import { useState, useMemo, useEffect } from "react";
import { PROGRAM, TIERS, dayKeyForToday } from "./data.js";
import { useLog } from "./useLog.js";
import RestTimer from "./RestTimer.jsx";
import IntervalDay from "./IntervalDay.jsx";
import ProgressView from "./ProgressView.jsx";

const DAY_KEYS = ["mon", "tue", "thu", "fri"];

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function ExerciseRow({ exercise, tier, addEntry, lastFor }) {
  const variants = useMemo(() => [exercise, ...(exercise.alternates || [])], [exercise]);
  const [variantIndex, setVariantIndex] = useState(0);
  const active = variants[variantIndex];
  const isCheck = active.logType === "check";
  const isRepsOnly = active.logType === "reps";
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [logged, setLogged] = useState(false);
  const last = lastFor(active.name);
  // Prefill from the previous session so a repeat set is a single tap on Log.
  const lastWeight = !isRepsOnly && last && last.weight != null ? last.weight : null;
  const lastReps = last && last.reps != null ? last.reps : null;

  // Each variant is a different exercise — don't carry typed values across.
  useEffect(() => {
    setWeight("");
    setReps("");
  }, [variantIndex]);

  function submit(e) {
    e.preventDefault();
    const w = isRepsOnly ? null : weight ? Number(weight) : lastWeight;
    const r = reps ? Number(reps) : lastReps;
    if (w == null && r == null) return;
    addEntry({
      exerciseName: active.name,
      weight: w,
      reps: r,
    });
    setLogged(true);
    setTimeout(() => setLogged(false), 1400);
    setWeight("");
    setReps("");
  }

  function markDone() {
    addEntry({ exerciseName: active.name, done: true });
    setLogged(true);
    setTimeout(() => setLogged(false), 1400);
  }

  return (
    <div className="exercise-row" style={tier ? { borderLeftColor: TIERS[tier].color } : undefined}>
      <div className="exercise-info">
        {variants.length > 1 && (
          <div className="variant-picker">
            {variants.map((v, i) => (
              <button
                type="button"
                key={v.name}
                className={`chip chip-sm ${i === variantIndex ? "chip-active" : ""}`}
                onClick={() => setVariantIndex(i)}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
        <div className="exercise-name">{active.name}</div>
        <div className="exercise-target">{active.target}</div>
        {last && (
          <div className="exercise-last">
            {isCheck
              ? `Done · ${fmtDate(last.date)}`
              : `Last: ${last.weight ? `${last.weight} lb` : ""}${last.weight && last.reps ? " × " : ""}${last.reps ? `${last.reps} reps` : ""} · ${fmtDate(last.date)}`}
          </div>
        )}
      </div>
      {isCheck ? (
        <div className="exercise-log">
          <button
            type="button"
            className={`btn btn-log btn-check ${logged ? "btn-log-done" : ""}`}
            onClick={markDone}
          >
            {logged ? "✓" : "Done"}
          </button>
        </div>
      ) : (
        <form className="exercise-log" onSubmit={submit}>
          {!isRepsOnly && (
            <input
              type="number"
              inputMode="decimal"
              placeholder={lastWeight != null ? String(lastWeight) : "lb"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="log-input"
            />
          )}
          <input
            type="number"
            inputMode="numeric"
            placeholder={lastReps != null ? String(lastReps) : "reps"}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className={isRepsOnly ? "log-input" : "log-input log-input-small"}
          />
          <button type="submit" className={`btn btn-log ${logged ? "btn-log-done" : ""}`}>
            {logged ? "✓" : "Log"}
          </button>
        </form>
      )}
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

      {day.type === "interval" ? (
        <IntervalDay protocol={day.protocol} addEntry={addEntry} lastFor={lastFor} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

function FileSyncBar({ fileState, connectFile, reconnectFile, disconnectFile }) {
  if (!fileState.supported) return null;

  if (fileState.needsReconnect) {
    return (
      <div className="file-sync-bar">
        <span>Local file access to "{fileState.fileName}" needs to be reconnected.</span>
        <button className="btn btn-sm" onClick={reconnectFile}>Reconnect</button>
      </div>
    );
  }

  if (fileState.connected) {
    return (
      <div className="file-sync-bar">
        <span>Synced to "{fileState.fileName}" on this device.</span>
        <button className="btn btn-sm" onClick={disconnectFile}>Disconnect</button>
      </div>
    );
  }

  return (
    <div className="file-sync-bar">
      <button className="btn btn-sm" onClick={connectFile}>Save history to a file on this device</button>
    </div>
  );
}

function HistoryView({ entries, removeEntry, fileState, connectFile, reconnectFile, disconnectFile }) {
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
    return (
      <>
        <FileSyncBar
          fileState={fileState}
          connectFile={connectFile}
          reconnectFile={reconnectFile}
          disconnectFile={disconnectFile}
        />
        <p className="empty-state">No sets logged yet. Log a weight and it'll show up here.</p>
      </>
    );
  }

  return (
    <div className="history">
      <FileSyncBar
        fileState={fileState}
        connectFile={connectFile}
        reconnectFile={reconnectFile}
        disconnectFile={disconnectFile}
      />
      {grouped.map(([date, items]) => (
        <div key={date} className="history-day">
          <h3 className="history-date">{date}</h3>
          {items.map((e) => (
            <div key={e.id} className="history-row">
              <span className="history-name">{e.exerciseName}</span>
              <span className="history-value">
                {e.modality
                  ? `${e.modality}${e.rpe ? ` · RPE ${e.rpe}` : ""}`
                  : e.done
                  ? "✓ Done"
                  : `${e.weight ? `${e.weight} lb` : ""}${e.weight && e.reps ? " × " : ""}${e.reps ? `${e.reps} reps` : ""}`}
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
  const { entries, addEntry, removeEntry, lastFor, fileState, connectFile, reconnectFile, disconnectFile } =
    useLog();
  const [tab, setTab] = useState("workout");
  const [timerOpen, setTimerOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <div className="eyebrow">Physio Program</div>
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
            className={`tab ${tab === "progress" ? "tab-active" : ""}`}
            onClick={() => setTab("progress")}
          >
            Progress
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
        ) : tab === "progress" ? (
          <ProgressView entries={entries} />
        ) : (
          <HistoryView
            entries={entries}
            removeEntry={removeEntry}
            fileState={fileState}
            connectFile={connectFile}
            reconnectFile={reconnectFile}
            disconnectFile={disconnectFile}
          />
        )}
      </main>

      <RestTimer open={timerOpen} onClose={() => setTimerOpen(false)} />
    </div>
  );
}
