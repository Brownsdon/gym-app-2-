// Richard's physio-certified program.
// Tiers: control (non-negotiable motor control) -> core (anti-rotation) -> compound (strength)
// 4-day week: Mon short session, Tue + Thu full compound days, Fri VO2max intervals.
// Exercises with "alternates" are options prescribed as interchangeable —
// pick whichever variant that day in the app.
//
// Aug 2026 review (Claire): the hip issue is a movement-control problem, not
// laxity or structure. The approach is now graded EXPOSURE to provocative
// ranges (hip adduction + internal rotation under load), not avoidance.
// Loaded split squats and full-range hip thrusters are both cleared.

export const TIERS = {
  control: { label: "Motor Control", short: "T1", color: "#2f6f66" },
  core: { label: "Core Anti-Rotation", short: "T2", color: "#b8863b" },
  compound: { label: "Compound Strength", short: "T3", color: "#3a4a63" },
};

// logType: "check" — logged done/not-done, nothing to measure.
// logType: "reps"  — bodyweight/band work logged by reps only, no weight.
// logType: "hold"  — time-based hold, logged in seconds rather than reps.
// graded: true     — progression runs along a quality axis (gradeHint), not
//                    load. Logs a level number alongside the usual fields.
const MOTOR_CONTROL = [
  {
    name: "Single-Leg Stance on BOSU",
    target: "1–3 sets × 20–30s hold",
    logType: "hold",
  },
  {
    name: "Airplane",
    target: "1–3 sets × 6–10 reps — supported; grade by reducing depth and rotation range",
    logType: "reps",
    graded: true,
    gradeHint: "Depth + rotation range",
  },
  {
    name: "Hip Abduction + IR/ER",
    target: "2–3 sets × 8–12 reps",
    logType: "reps",
    alternates: [
      { name: "Hip Abduction Rainbow", target: "2–3 sets × 8–12 reps", logType: "reps" },
    ],
  },
  {
    name: "Hip IR Isometric Holds",
    target: "2–3 sets × 20–30s hold in each position — grade by degree of hip drop",
    logType: "hold",
    graded: true,
    gradeHint: "Degree of hip drop",
  },
  {
    name: "Hip IR Step-Downs",
    target: "2–3 sets × 8–12 reps in internal rotation — grade by degree of hip drop",
    logType: "reps",
    graded: true,
    gradeHint: "Degree of hip drop",
  },
];

const MOTOR_CONTROL_BLOCK = {
  title: "Motor Control",
  tier: "control",
  note: "Every session, first. Control and quality over load.",
  exercises: MOTOR_CONTROL,
};

export const PROGRAM = {
  mon: {
    label: "Monday",
    short: "Mon",
    title: "Control + Hip Hinge",
    note: "Shorter session. Motor control block plus the hip thrust slot — full range, now cleared.",
    duration: "30–35 min",
    blocks: [
      MOTOR_CONTROL_BLOCK,
      {
        title: "Lower",
        tier: "compound",
        exercises: [
          { name: "Hip Thrusters", target: "3 sets — full range to neutral" },
          {
            name: "Single Leg Sit to Stand",
            target: "2 sets",
            alternates: [{ name: "Hip Hike + Step Down", target: "2 sets", logType: "reps" }],
          },
        ],
      },
      {
        title: "Core",
        tier: "core",
        exercises: [{ name: "Ab Roll with Wheel", target: "2 sets", logType: "reps" }],
      },
    ],
  },
  tue: {
    label: "Tuesday",
    short: "Tue",
    title: "Compound A — Squat + Upper Pull",
    note: "Full session. Motor control then squats; upper pull is the first thing to cut if time is short.",
    duration: "45–50 min",
    blocks: [
      MOTOR_CONTROL_BLOCK,
      {
        title: "Lower",
        tier: "compound",
        exercises: [
          { name: "Split Squat", target: "10 reps, 2s hold, 3 sets — cleared to load" },
          {
            name: "Squat (Barbell)",
            target: "3–4 sets — weights racked at shoulders",
            alternates: [{ name: "Goblet Squat to Bench", target: "2 sets" }],
          },
        ],
      },
      {
        title: "Core",
        tier: "core",
        exercises: [
          {
            name: "Cable Chop, High to Low",
            target: "2 sets",
            alternates: [
              { name: "Hip Flexor Drive with Oblique Twist", target: "2 sets", logType: "reps" },
              { name: "Palloff Press", target: "2 sets" },
            ],
          },
          { name: "Ab Roll with Wheel", target: "2 sets", logType: "reps" },
        ],
      },
      {
        title: "If time — Upper Pull",
        tier: "compound",
        exercises: [
          {
            name: "Overhead Farmers Carry",
            target: "2 sets",
            alternates: [
              { name: "Farmers Carry", target: "2 sets" },
              { name: "Overhead Dumbbell Press", target: "3 sets" },
            ],
          },
          {
            name: "Lat Pull Down",
            target: "10 reps, 2s hold, 3 sets",
            alternates: [{ name: "Pull Ups", target: "3 sets, 8–10 reps", logType: "reps" }],
          },
          { name: "Supermans (hold + swimmers)", target: "2 sets", logType: "reps" },
        ],
      },
    ],
  },
  thu: {
    label: "Thursday",
    short: "Thu",
    title: "Compound B — Deadlift + Upper Push",
    note: "Full session. Motor control then deadlifts; upper push is the first thing to cut if time is short.",
    duration: "45–50 min",
    blocks: [
      MOTOR_CONTROL_BLOCK,
      {
        title: "Lower",
        tier: "compound",
        exercises: [
          { name: "Deadlift", target: "3–4 sets — dumbbells or barbell" },
          { name: "Single Leg Calf Raises", target: "2 sets" },
        ],
      },
      {
        title: "Core",
        tier: "core",
        exercises: [
          {
            name: "Cable Chop, Low to High",
            target: "2 sets",
            alternates: [
              { name: "Hip Flexor Drive with Oblique Twist", target: "2 sets", logType: "reps" },
              { name: "Palloff Press", target: "2 sets" },
            ],
          },
          {
            name: "Stability Ball Figure 8s",
            target: "2 sets",
            logType: "reps",
            alternates: [{ name: "Ab Roll with Wheel", target: "2 sets", logType: "reps" }],
          },
        ],
      },
      {
        title: "If time — Upper Push",
        tier: "compound",
        exercises: [
          {
            name: "Push Ups",
            target: "3 sets",
            logType: "reps",
            alternates: [{ name: "Dumbbell Chest Press", target: "3 sets" }],
          },
          {
            name: "Cable Rows",
            target: "3 sets",
            alternates: [{ name: "Reverse Fly", target: "2 sets" }],
          },
          { name: "Supermans (legs and arms)", target: "2 sets", logType: "reps" },
        ],
      },
    ],
  },
  fri: {
    label: "Friday",
    short: "Fri",
    title: "VO2Max Intervals",
    note: "4 rounds of hard work / easy recovery. Push the work interval, let the rest interval actually recover you.",
    duration: "35–40 min",
    type: "interval",
    protocol: {
      rounds: 4,
      workSeconds: 240,
      restSeconds: 180,
      modalities: ["Bike", "Rower", "Run", "Other"],
    },
  },
};

export const ALL_EXERCISES = Array.from(
  new Set(
    Object.values(PROGRAM).flatMap((day) =>
      (day.blocks || []).flatMap((b) =>
        b.exercises.flatMap((e) => [e.name, ...((e.alternates || []).map((a) => a.name))])
      )
    )
  )
);

export function dayKeyForToday() {
  const d = new Date().getDay(); // 0 Sun ... 6 Sat
  if (d === 1) return "mon";
  if (d === 2) return "tue";
  if (d === 4) return "thu";
  if (d === 5) return "fri";
  return null; // no session today; caller decides fallback
}

// --- Day keys (local time, so a session lands on the day you trained) ---

export function localDayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayKey() {
  return localDayKey(new Date().toISOString());
}

// --- Session notes -------------------------------------------------------
// Short-lived, date-stamped adjustments agreed in conversation. A note is
// only ever read on its own date, so the programme reverts to normal by
// itself the next day — nothing to remember to undo.
//
// tone drives the badge colour: "ease" | "swap" | "skip" | "go".
// muteCelebrations silences the PR pops, for days where chasing a number
// is the opposite of the plan.

export const SESSION_NOTES = {
  "2026-09-24": {
    headline: "Squat swaps in for deadlift today — light, to close the gap",
    why: "The barbell squat hasn't been done since the 160 lb session that provoked your back on the 15th. Left until Tuesday it becomes a 14-day gap on your worst gap-then-spike lift. Deadlift had its light re-entry last Thursday, so it can wait a week. Doing both today would stack two spine-loading lifts in one session — the same stacking that went wrong on the 14th–15th. So: one or the other, and the squat is the one with the open risk.",
    stopRules: [
      "Squat ~135 lb × 10, 2–3 sets. That's reopening the pattern, not testing it. Legs will feel it's easy — that's the point; it's the back we're checking.",
      "Any back tightness during warm-up or working sets → stop squatting for today, finish the session without it.",
      "Comfortable depth only. Tuesday's twinge was at end-range; no need to chase the bottom of the squat today.",
      "Grades hold at L4 — Tuesday's twinge means this wasn't a fully quiet week. Step up next Monday if it stays calm.",
      "Log a check-in. It's still the gap in the data.",
    ],
    extraBlocks: [
      {
        title: "Today — Squat (swapped in)",
        tier: "compound",
        exercises: [
          {
            name: "Squat (Barbell)",
            target: "Light re-entry: ~135 lb × 10, 2–3 sets",
            alternates: [{ name: "Goblet Squat to Bench", target: "If the rack's busy again: 70–80 lb × 10, 2 sets" }],
          },
        ],
      },
    ],
    adjustments: {
      "Squat (Barbell)": {
        tone: "go",
        tag: "Light re-entry",
        detail: "~135 lb, not 160. 9 days since the load that flared your back. Rebuild: ~145 Tue, 150+ after that.",
      },
      "Goblet Squat to Bench": {
        tone: "swap",
        tag: "Rack busy?",
        detail: "Use this instead — same pattern, less spinal load. Don't do both.",
      },
      "Deadlift": {
        tone: "skip",
        tag: "Skip today",
        detail: "Squat takes the lower slot. Back next Thursday at ~110 lb — the second step of its re-entry.",
      },
      "Hip IR Step-Downs": { tone: "ease", tag: "Hold L4", detail: "Not L5 yet — Tuesday's twinge says wait one more session." },
    },
  },
  "2026-09-22": {
    headline: "Full Tuesday — first session with both triggers back in it",
    why: "Hip's good, back's settled, so this is a normal session with no restrictions. Worth naming what today is, though: split squats are what nudged the hip on the 14th, and 160 lb squats are what the back reacted to on the 15th. Both are back, in the same session, for the first time since. Run them — just not at the ceiling.",
    stopRules: [
      "One squat pattern, not two. Barbell or goblet — the 14th had both plus split squats, and that stacked up.",
      "Grade holds at L4 today. Monday was the step up; step again Thursday if it stays quiet.",
      "Anything from the hip during split squats, or the back during squats, and that lift is done for today.",
    ],
    adjustments: {
      "Split Squat": {
        tone: "ease",
        tag: "Hold at 90",
        detail: "90 lb, 2-3 sets, no more. This is the hip's exposure, not a progression day.",
      },
      "Squat (Barbell)": {
        tone: "ease",
        tag: "145-150, not 160",
        detail: "160 x 12 x 3 is the exact load the back reacted to last Tuesday. Rebuild to it over two or three sessions.",
      },
      "Lat Pull Down": {
        tone: "go",
        tag: "Take it if time",
        detail: "Upper pull is your most-skipped block and pulling volume is thin. Good day for it — the lower work is capped.",
      },
    },
  },
  "2026-09-21": {
    headline: "Regular Monday — hip's good, just ease the grade back up",
    why: "One catch all weekend, against most of last Monday and Tuesday. Normal session, no restrictions. Two things only: walk the grade back up rather than jumping to L5, and keep Monday as Monday.",
    stopRules: [
      "Grade ~L4 today, not straight back to L5. Step up a notch, see how it sits, go again Thursday.",
      "No split squats today — they belong to Tuesday. Last Monday's 'bit of Tuesday' is what started this.",
      "Hip thrusters at 80 lb as normal, full range.",
    ],
    adjustments: {
      "Airplane": { tone: "go", tag: "Step up", detail: "~L4 today — up from Thursday's L3, not back to L5." },
      "Hip IR Isometric Holds": { tone: "go", tag: "Step up", detail: "~L4 today." },
      "Hip IR Step-Downs": { tone: "go", tag: "Step up", detail: "~L4 today. This is the drill the hip reacts to, so move it a notch at a time." },
    },
  },
  "2026-09-18": {
    headline: "Easy day — the bike is the safest session you've got right now",
    why: "Back flared Tuesday, hip was sensitive midweek, both are settling. Cycling loads neither. Worth knowing: your last two interval sessions were logged at RPE 9 and RPE 10 — that is redlining a protocol meant to sit nearer 8, which is a fair reason it feels like a chore. Today is a deliberately easier one.",
    stopRules: [
      "Aim RPE 7, not 9. A session you'd repeat next week beats a heroic one you avoid for a month.",
      "2 or 3 rounds counts. Log it and go — a short session is a completed session.",
      "Painless clicking is not a reason to skip; note it in the check-in and raise it at the next review.",
    ],
    adjustments: {},
  },
  "2026-09-17": {
    headline: "Caution day — hip sensitive, back 2 days post-flare",
    why: "Hip was catching Wednesday and the back flared Tuesday night. Graded exposure still applies, just a few notches down. Deadlift is 29 days stale, so today reopens the pattern rather than loading it.",
    muteCelebrations: true,
    stopRules: [
      "Hip catches during step-downs or Airplane → drop the grade again, don't push through. Pain-free is the target.",
      "Any back tightness in the hinge warm-up → the hinge is done for today. No negotiating mid-session.",
      "Nothing new: no PRs, no top loads, no first-time exercises.",
    ],
    adjustments: {
      "Airplane": { tone: "ease", tag: "Ease", detail: "Grade ~L3 today, not L5." },
      "Hip IR Step-Downs": {
        tone: "ease",
        tag: "Ease",
        detail: "Grade ~L3 today. This is the provocative position and the hip is sensitive.",
      },
      "Hip IR Isometric Holds": { tone: "ease", tag: "Ease", detail: "Grade ~L3 today, not L5." },
      "Deadlift": {
        tone: "ease",
        tag: "Light re-entry",
        detail: "100–110 lb, 2 sets of 8, dumbbells not barbell. Last deadlift was 29 days ago at 150.",
      },
      "Cable Chop, Low to High": {
        tone: "swap",
        tag: "Swap",
        detail: "Take Palloff Press instead — anti-rotation rather than loaded rotation, kinder to the back today.",
      },
      "Ab Roll with Wheel": {
        tone: "skip",
        tag: "Skip or keep short",
        detail: "Big anti-extension demand on a back that has just settled.",
      },
      "Stability Ball Figure 8s": {
        tone: "skip",
        tag: "Not today",
        detail: "Never logged before — a caution day is the wrong day for a first attempt.",
      },
      "Push Ups": {
        tone: "go",
        tag: "Promoted",
        detail: "Upper push is the safest work in the session today, and the light hinge frees the time.",
      },
    },
  },
};

export function sessionNoteForToday() {
  return SESSION_NOTES[todayKey()] || null;
}

export const REST_PRESETS = [60, 90, 120];
