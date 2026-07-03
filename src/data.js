// Richard's physio-certified program, built with Claire.
// Tiers: rehab (non-negotiable) -> core (anti-rotation) -> compound (strength)
// 4-day week: Mon hip/rehab, Tue + Thu compound, Fri VO2max intervals.
// Exercises with "alternates" are options Claire prescribed as interchangeable —
// pick whichever variant that day in the app.

export const TIERS = {
  rehab: { label: "Rehab & Stability", short: "T1", color: "#2f6f66" },
  core: { label: "Core Anti-Rotation", short: "T2", color: "#b8863b" },
  compound: { label: "Compound Strength", short: "T3", color: "#3a4a63" },
};

const WARMUP = [
  { name: "Prone Press Ups", target: "10 reps, 2s hold, 2 sets" },
  { name: "Book Opener Stretch", target: "8 each side, 2 sets" },
  { name: "90/90 Hip Mobility", target: "6 each side" },
];

export const PROGRAM = {
  mon: {
    label: "Monday",
    short: "Mon",
    title: "Hip & Core",
    note: "Rehab maintenance. Short session — this is the one that's hardest to skip.",
    duration: "25–30 min",
    blocks: [
      { title: "Warm-up", tier: null, exercises: WARMUP },
      {
        title: "Hip Rehab",
        tier: "rehab",
        exercises: [
          {
            name: "Hip Abduction + IR/ER",
            target: "3 sets",
            alternates: [{ name: "Hip Abduction Rainbow", target: "3 sets" }],
          },
          {
            name: "Airplane",
            target: "2 sets",
            alternates: [
              { name: "Hip Hike + Step Down", target: "2 sets" },
              { name: "Captain Morgan", target: "2 sets" },
            ],
          },
        ],
      },
      {
        title: "Core",
        tier: "core",
        exercises: [{ name: "Ab Roll with Wheel", target: "2 sets" }],
      },
      {
        title: "If time — Upper",
        tier: "compound",
        exercises: [
          {
            name: "Lat Pull Down",
            target: "2–3 sets",
            alternates: [{ name: "Pull Ups", target: "2–3 sets, 8–10 reps" }],
          },
        ],
      },
    ],
  },
  tue: {
    label: "Tuesday",
    short: "Tue",
    title: "Compound A — Lower + Upper Pull",
    note: "Full session. Compounds are priority if time gets tight.",
    duration: "40–45 min",
    blocks: [
      { title: "Warm-up", tier: null, exercises: WARMUP },
      {
        title: "Lower",
        tier: "compound",
        exercises: [
          { name: "Split Squat", target: "10 reps, 2s hold, 3 sets" },
          { name: "Lateral Squat", target: "3 sets" },
          {
            name: "Single Leg Sit to Stand",
            target: "2 sets",
            alternates: [{ name: "Single Leg Step Up", target: "2 sets" }],
          },
          {
            name: "Squat (Barbell)",
            target: "3–4 sets",
            alternates: [{ name: "Goblet Squat to Bench", target: "2 sets" }],
          },
        ],
      },
      {
        title: "Core",
        tier: "core",
        exercises: [
          { name: "Cable Chop, High to Low", target: "2 sets" },
          { name: "Ab Roll with Wheel", target: "2 sets" },
          { name: "Palloff Press", target: "2 sets" },
        ],
      },
      {
        title: "Upper Pull",
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
            alternates: [{ name: "Pull Ups", target: "3 sets, 8–10 reps" }],
          },
          { name: "Supermans (hold + swimmers)", target: "2 sets" },
        ],
      },
      {
        title: "Hip — if time",
        tier: "rehab",
        exercises: [
          {
            name: "Hip Abduction + IR/ER",
            target: "3 sets",
            alternates: [{ name: "Hip Abduction Rainbow", target: "3 sets" }],
          },
        ],
      },
    ],
  },
  thu: {
    label: "Thursday",
    short: "Thu",
    title: "Compound B — Posterior Chain + Upper Push",
    note: "Full session. Stop hip thrusters short of full extension until Claire clears full range.",
    duration: "40–45 min",
    blocks: [
      { title: "Warm-up", tier: null, exercises: WARMUP },
      {
        title: "Posterior Chain",
        tier: "compound",
        exercises: [
          { name: "Deadlift", target: "3–4 sets" },
          { name: "Hip Thrusters", target: "3 sets — stop short of full extension" },
          { name: "Single Leg Calf Raises", target: "2 sets" },
        ],
      },
      {
        title: "Core",
        tier: "core",
        exercises: [
          { name: "Cable Chop, Low to High", target: "2 sets" },
          { name: "Stability Ball Figure 8s", target: "2 sets — optional, skip if short on time" },
          { name: "Ab Roll with Wheel", target: "2 sets" },
        ],
      },
      {
        title: "Upper Push",
        tier: "compound",
        exercises: [
          {
            name: "Push Ups",
            target: "3 sets",
            alternates: [{ name: "Dumbbell Chest Press", target: "3 sets" }],
          },
          { name: "Wrist Flexion Curls", target: "2 sets — add back if elbow flares" },
          {
            name: "Cable Rows",
            target: "3 sets",
            alternates: [{ name: "Reverse Fly", target: "2 sets" }],
          },
          { name: "Supermans (legs and arms)", target: "2 sets" },
        ],
      },
      {
        title: "Hip — if time",
        tier: "rehab",
        exercises: [
          {
            name: "Hip Abduction Rainbow",
            target: "3 sets",
            alternates: [{ name: "Hip Abduction + IR/ER", target: "3 sets" }],
          },
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
