import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { PROGRAM, TIERS, dayKeyForToday } from "./data.js";
import { useLog } from "./useLog.js";
import { useWakeLock } from "./useWakeLock.js";
import RestTimer from "./RestTimer.jsx";
import IntervalDay from "./IntervalDay.jsx";
import ProgressView from "./ProgressView.jsx";
import { exportEntries, parseBackup } from "./exportLog.js";
import CheckIn, { AREAS, isCheckin, localDayKey, todayKey } from "./CheckIn.jsx";

const DAY_KEYS = ["mon", "tue", "thu", "fri"];

const FLYBY_ANIMALS = ["🐐", "🦖", "🦅", "🐎", "🦘", "🐆", "🦍", "🐢"];
const PR_MESSAGES = ["Nice one!", "New best!", "Stronger!", "Level up!"];

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// One place that knows how a logged entry reads, whatever kind it is.
export function fmtEntryValue(e) {
  if (isCheckin(e)) {
    const parts = AREAS.map((a) => `${a.label} ${e[a.key]}`);
    return e.note ? `${parts.join(" · ")} — ${e.note}` : parts.join(" · ");
  }
  if (e.modality) return `${e.modality}${e.rpe ? ` · RPE ${e.rpe}` : ""}`;
  if (e.done) return "✓ Done";
  const parts = [];
  if (e.weight != null) parts.push(`${e.weight} lb`);
  if (e.seconds != null) parts.push(`${e.seconds}s`);
  if (e.reps != null) parts.push(`${e.reps} reps`);
  let text = parts.join(" × ");
  if (e.level != null) text += `${text ? " · " : ""}level ${e.level}`;
  return text;
}

function ExerciseRow({ exercise, tier, addEntry, lastFor, onCelebrate }) {
  const variants = useMemo(() => [exercise, ...(exercise.alternates || [])], [exercise]);
  const [variantIndex, setVariantIndex] = useState(0);
  const active = variants[variantIndex];
  const isCheck = active.logType === "check";
  const isRepsOnly = active.logType === "reps";
  const isHold = active.logType === "hold";
  const isGraded = Boolean(active.graded);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [seconds, setSeconds] = useState("");
  const [level, setLevel] = useState("");
  const [logged, setLogged] = useState(false);
  const [pr, setPr] = useState(null);
  const prTimeout = useRef(null);
  const last = lastFor(active.name);
  // Prefill from the previous session so a repeat set is a single tap on Log.
  const lastWeight = !isRepsOnly && !isHold && last && last.weight != null ? last.weight : null;
  const lastReps = !isHold && last && last.reps != null ? last.reps : null;
  const lastSeconds = isHold && last && last.seconds != null ? last.seconds : null;
  const lastLevel = isGraded && last && last.level != null ? last.level : null;

  // Each variant is a different exercise — don't carry typed values across.
  useEffect(() => {
    setWeight("");
    setReps("");
    setSeconds("");
    setLevel("");
  }, [variantIndex]);

  useEffect(() => () => clearTimeout(prTimeout.current), []);

  // Beat the previous session and a green "Nice one!" pops up (with the
  // occasional flying animal). Progressing the grade counts: on the graded
  // drills that axis is the point, not the load.
  function checkForPr({ w, r, s, lv }) {
    if (!last) return;
    let delta = null;
    if (isGraded && lv != null && last.level != null && lv > last.level) {
      delta = `+${lv - last.level} level`;
    } else if (isHold) {
      if (s != null && last.seconds != null && s > last.seconds) delta = `+${s - last.seconds}s`;
    } else if (w != null && last.weight != null) {
      if (w > last.weight) delta = `+${w - last.weight} lb`;
      else if (w === last.weight && r != null && last.reps != null && r > last.reps)
        delta = `+${r - last.reps} reps`;
    } else if (w == null && last.weight == null && r != null && last.reps != null && r > last.reps) {
      delta = `+${r - last.reps} reps`;
    }
    if (!delta) return;
    const text = PR_MESSAGES[Math.floor(Math.random() * PR_MESSAGES.length)];
    setPr({ text: `${text} ${delta}`, key: Date.now() });
    clearTimeout(prTimeout.current);
    prTimeout.current = setTimeout(() => setPr(null), 2000);
    if (Math.random() < 0.5) onCelebrate();
  }

  function submit(e) {
    e.preventDefault();
    const w = isRepsOnly || isHold ? null : weight ? Number(weight) : lastWeight;
    const r = isHold ? null : reps ? Number(reps) : lastReps;
    const s = isHold ? (seconds ? Number(seconds) : lastSeconds) : null;
    const lv = isGraded ? (level ? Number(level) : lastLevel) : null;
    if (w == null && r == null && s == null) return;
    checkForPr({ w, r, s, lv });
    addEntry({
      exerciseName: active.name,
      weight: w,
      reps: r,
      ...(s != null ? { seconds: s } : {}),
      ...(lv != null ? { level: lv } : {}),
    });
    setLogged(true);
    setTimeout(() => setLogged(false), 1400);
    setWeight("");
    setReps("");
    setSeconds("");
    setLevel("");
  }

  function markDone() {
    addEntry({ exerciseName: active.name, done: true });
    setLogged(true);
    setTimeout(() => setLogged(false), 1400);
    if (Math.random() < 0.25) onCelebrate();
  }

  return (
    <div
      className={`exercise-row ${pr ? "exercise-row-pr" : ""}`}
      style={tier ? { borderLeftColor: TIERS[tier].color } : undefined}
    >
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
              : `Last: ${fmtEntryValue(last)} · ${fmtDate(last.date)}`}
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
          {pr && (
            <div key={pr.key} className="pr-pop" aria-hidden="true">
              {pr.text}
            </div>
          )}
          {!isRepsOnly && !isHold && (
            <input
              type="number"
              inputMode="decimal"
              placeholder={lastWeight != null ? String(lastWeight) : "lb"}
              aria-label="Weight in pounds"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="log-input"
            />
          )}
          {isHold ? (
            <input
              type="number"
              inputMode="numeric"
              placeholder={lastSeconds != null ? String(lastSeconds) : "sec"}
              aria-label="Hold time in seconds"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className={isGraded ? "log-input log-input-small" : "log-input"}
            />
          ) : (
            <input
              type="number"
              inputMode="numeric"
              placeholder={lastReps != null ? String(lastReps) : "reps"}
              aria-label="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className={isRepsOnly && !isGraded ? "log-input" : "log-input log-input-small"}
            />
          )}
          {isGraded && (
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="5"
              placeholder={lastLevel != null ? String(lastLevel) : "lvl"}
              aria-label={`Level — ${active.gradeHint || "grade"}`}
              title={active.gradeHint || "Level"}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="log-input log-input-small"
            />
          )}
          <button type="submit" className={`btn btn-log ${logged ? "btn-log-done" : ""}`}>
            {logged ? "✓" : "Log"}
          </button>
        </form>
      )}
    </div>
  );
}

function WorkoutView({ addEntry, lastFor, onOpenTimer, onCelebrate, checkInProps }) {
  const today = dayKeyForToday();
  const [dayKey, setDayKey] = useState(today || "tue");
  const day = PROGRAM[dayKey];

  return (
    <div>
      <CheckIn {...checkInProps} />

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
              {block.note && <p className="block-note">{block.note}</p>}
              {block.exercises.map((ex) => (
                <ExerciseRow
                  key={ex.name}
                  exercise={ex}
                  tier={block.tier}
                  addEntry={addEntry}
                  lastFor={lastFor}
                  onCelebrate={onCelebrate}
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

function BackupBar({ entries, importEntries }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null);

  async function onExport() {
    if (entries.length === 0) {
      setStatus("Nothing to export yet.");
      return;
    }
    const result = await exportEntries(entries);
    if (result === "shared") setStatus(`Shared a backup of ${entries.length} entries.`);
    else if (result === "downloaded") setStatus(`Downloaded a backup of ${entries.length} entries.`);
  }

  async function onImportFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const incoming = parseBackup(await file.text());
      const added = importEntries(incoming);
      setStatus(
        added > 0
          ? `Imported ${added} new ${added === 1 ? "entry" : "entries"}.`
          : "No new entries — everything in that backup is already here."
      );
    } catch {
      setStatus("Couldn't read that file — is it a gym-log backup (.json)?");
    }
  }

  return (
    <div className="backup-bar">
      <div className="backup-actions">
        <button className="btn btn-sm" onClick={onExport}>Export backup</button>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>Import</button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={onImportFile}
          hidden
        />
      </div>
      {status && <div className="backup-status">{status}</div>}
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

function HistoryView({
  entries,
  removeEntry,
  importEntries,
  fileState,
  connectFile,
  reconnectFile,
  disconnectFile,
}) {
  const grouped = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = fmtDate(e.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  return (
    <div className="history">
      <BackupBar entries={entries} importEntries={importEntries} />
      <FileSyncBar
        fileState={fileState}
        connectFile={connectFile}
        reconnectFile={reconnectFile}
        disconnectFile={disconnectFile}
      />
      {entries.length === 0 && (
        <p className="empty-state">No sets logged yet. Log a weight and it'll show up here.</p>
      )}
      {grouped.map(([date, items]) => (
        <div key={date} className="history-day">
          <h3 className="history-date">{date}</h3>
          {items.map((e) => (
            <div key={e.id} className={`history-row ${isCheckin(e) ? "history-row-checkin" : ""}`}>
              <span className="history-name">{isCheckin(e) ? "Check-in" : e.exerciseName}</span>
              <span className="history-value">{fmtEntryValue(e)}</span>
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
  const {
    entries,
    addEntry,
    removeEntry,
    importEntries,
    saveCheckin,
    lastFor,
    fileState,
    connectFile,
    reconnectFile,
    disconnectFile,
  } = useLog();
  const [tab, setTab] = useState("workout");
  const [timerOpen, setTimerOpen] = useState(false);
  const checkIns = useMemo(() => entries.filter(isCheckin), [entries]);
  const todayEntry = useMemo(
    () => checkIns.find((e) => localDayKey(e.date) === todayKey()) || null,
    [checkIns]
  );
  const yesterdayEntry = useMemo(
    () => checkIns.find((e) => localDayKey(e.date) !== todayKey()) || null,
    [checkIns]
  );
  const [flyby, setFlyby] = useState(null);
  const flybyTimeout = useRef(null);
  useWakeLock();

  useEffect(() => () => clearTimeout(flybyTimeout.current), []);

  const celebrate = useCallback(() => {
    setFlyby({
      emoji: FLYBY_ANIMALS[Math.floor(Math.random() * FLYBY_ANIMALS.length)],
      top: 15 + Math.random() * 50,
      key: Date.now(),
    });
    clearTimeout(flybyTimeout.current);
    flybyTimeout.current = setTimeout(() => setFlyby(null), 2200);
  }, []);

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
          <WorkoutView
            addEntry={addEntry}
            lastFor={lastFor}
            onOpenTimer={() => setTimerOpen(true)}
            onCelebrate={celebrate}
            checkInProps={{ todayEntry, yesterdayEntry, saveCheckin }}
          />
        ) : tab === "progress" ? (
          <ProgressView entries={entries} />
        ) : (
          <HistoryView
            entries={entries}
            removeEntry={removeEntry}
            importEntries={importEntries}
            fileState={fileState}
            connectFile={connectFile}
            reconnectFile={reconnectFile}
            disconnectFile={disconnectFile}
          />
        )}
      </main>

      <RestTimer open={timerOpen} onClose={() => setTimerOpen(false)} />

      {flyby && (
        <div key={flyby.key} className="flyby" style={{ top: `${flyby.top}%` }} aria-hidden="true">
          {flyby.emoji}
        </div>
      )}
    </div>
  );
}
