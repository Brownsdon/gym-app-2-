import { useState, useEffect } from "react";
import { localDayKey, todayKey } from "./data.js";

export { localDayKey, todayKey };

// Daily symptom check-in. Stored in the same log array as exercise entries
// (kind: "checkin") so it rides along with backup, import and file sync for
// free, and lands in the same file the physio review reads.

export const AREAS = [
  { key: "hip", label: "Hip" },
  { key: "back", label: "Back" },
];

const SCALE_HINT = "0 = fine · 10 = worst it gets";

export function isCheckin(e) {
  return e && e.kind === "checkin";
}

function Slider({ area, value, onChange }) {
  return (
    <div className="checkin-row">
      <label className="checkin-label" htmlFor={`checkin-${area.key}`}>
        {area.label}
      </label>
      <input
        id={`checkin-${area.key}`}
        className="checkin-slider"
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={`checkin-value ${value === 0 ? "checkin-value-zero" : ""}`}>{value}</span>
    </div>
  );
}

export default function CheckIn({ todayEntry, yesterdayEntry, saveCheckin }) {
  const [open, setOpen] = useState(false);
  // Default to yesterday's numbers — most days are a small delta, not a reset.
  const [values, setValues] = useState({ hip: 0, back: 0 });
  const [note, setNote] = useState("");

  useEffect(() => {
    const seed = todayEntry || yesterdayEntry;
    setValues({ hip: seed?.hip ?? 0, back: seed?.back ?? 0 });
    setNote(todayEntry?.note || "");
  }, [todayEntry, yesterdayEntry]);

  function save() {
    saveCheckin({ ...values, note: note.trim() || null });
    setOpen(false);
  }

  if (todayEntry && !open) {
    return (
      <div className="checkin-card checkin-done">
        <div className="checkin-summary">
          <span className="checkin-summary-label">Today</span>
          {AREAS.map((a) => (
            <span key={a.key} className="checkin-chip">
              {a.label} {todayEntry[a.key]}
            </span>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
          Edit
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="checkin-card">
        <div className="checkin-prompt">How's it feeling today?</div>
        <button className="btn btn-sm" onClick={() => setOpen(true)}>
          Check in
        </button>
      </div>
    );
  }

  return (
    <div className="checkin-card checkin-open">
      <div className="checkin-prompt">
        How's it feeling today?
        <span className="checkin-hint">{SCALE_HINT}</span>
      </div>
      {AREAS.map((a) => (
        <Slider
          key={a.key}
          area={a}
          value={values[a.key]}
          onChange={(v) => setValues((s) => ({ ...s, [a.key]: v }))}
        />
      ))}
      <input
        className="log-input checkin-note"
        placeholder="Note (optional) — e.g. stiff overnight, eased by mid-morning"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="checkin-actions">
        <button className="btn btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={save}>
          Save check-in
        </button>
      </div>
    </div>
  );
}
