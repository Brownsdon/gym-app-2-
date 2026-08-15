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

export const REST_PRESETS = [60, 90, 120];
