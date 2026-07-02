// Richard's physio-certified program, built with Claire.
// Tiers: rehab (non-negotiable) -> core (anti-rotation) -> compound (strength)

export const TIERS = {
  rehab: { label: "Rehab & Stability", short: "T1", color: "#2f6f66" },
  core: { label: "Core Anti-Rotation", short: "T2", color: "#b8863b" },
  compound: { label: "Compound Strength", short: "T3", color: "#3a4a63" },
};

export const PROGRAM = {
  mon: {
    label: "Monday",
    short: "Mon",
    title: "Hip & Core",
    note: "Rehab maintenance. Short session — this is the one that's hardest to skip.",
    duration: "25–35 min",
    blocks: [
      {
        title: "Warm-up",
        tier: null,
        exercises: [
          { name: "Prone Press Ups", target: "10 reps, 2s hold, 2 sets" },
          { name: "Book Opener Stretch", target: "8 each side, 2 sets" },
          { name: "90/90 Hip Mobility", target: "6 each side" },
        ],
      },
      {
        title: "Hip Rehab",
        tier: "rehab",
        exercises: [
          { name: "Hip Abduction + IR/ER", target: "3 sets" },
          { name: "Hip Abduction Rainbow", target: "3 sets" },
          { name: "Airplane", target: "2 sets" },
          { name: "Hip Hike + Step Down", target: "2 sets" },
        ],
      },
      {
        title: "Core",
        tier: "core",
        exercises: [
          { name: "Palloff Press", target: "2 sets" },
          { name: "Cable Chop, High to Low", target: "2 sets" },
        ],
      },
      {
        title: "If time allows",
        tier: "compound",
        exercises: [{ name: "Lat Pull Down", target: "2–3 sets" }],
      },
    ],
  },
  tue: {
    label: "Tuesday",
    short: "Tue",
    title: "Lower + Upper Pull",
    note: "Full session. Compounds are priority if time gets tight.",
    duration: "50–55 min",
    blocks: [
      {
        title: "Warm-up",
        tier: null,
        exercises: [
          { name: "Prone Press Ups", target: "10 reps, 2s hold, 2 sets" },
          { name: "Book Opener Stretch", target: "8 each side, 2 sets" },
          { name: "90/90 Hip Mobility", target: "6 each side" },
        ],
      },
      {
        title: "Lower",
        tier: "compound",
        exercises: [
          { name: "Split Squat", target: "10 reps, 2s hold, 3 sets" },
          { name: "Lateral Squat", target: "3 sets" },
          { name: "Single Leg Sit to Stand", target: "2 sets" },
          { name: "Single Leg Step Up", target: "2 sets" },
          { name: "Squat (barbell)", target: "3–4 sets" },
          { name: "Goblet Squat to Bench", target: "2 sets" },
          { name: "Captain Morgan", target: "2 sets" },
        ],
      },
      {
        title: "Core",
        tier: "core",
        exercises: [
          { name: "Cable Chop, High to Low", target: "2 sets" },
          { name: "Hip Flexor Drive + Oblique Twist", target: "2 sets" },
          { name: "Palloff Press", target: "2 sets" },
          { name: "Ab Roll with Wheel", target: "2 sets" },
        ],
      },
      {
        title: "Upper Pull",
        tier: "compound",
        exercises: [
          { name: "Overhead Farmers Carry", target: "2 sets" },
          { name: "Farmers Carry", target: "2 sets" },
          { name: "Overhead Dumbbell Press", target: "3 sets" },
          { name: "Lat Pull Down", target: "10 reps, 2s hold, 3 sets" },
          { name: "Pull Ups", target: "3 sets, 8–10 reps" },
          { name: "Wrist Extension Curls", target: "2 sets — add back if elbow flares" },
          { name: "Supermans (hold + swimmers)", target: "2 sets" },
        ],
      },
    ],
  },
  thu: {
    label: "Thursday",
    short: "Thu",
    title: "Posterior Chain + Upper Push",
    note: "Full session. Stop hip thrusters short of full extension until Claire clears full range.",
    duration: "50–55 min",
    blocks: [
      {
        title: "Warm-up",
        tier: null,
        exercises: [
          { name: "Prone Press Ups", target: "10 reps, 2s hold, 2 sets" },
          { name: "Book Opener Stretch", target: "8 each side, 2 sets" },
          { name: "90/90 Hip Mobility", target: "6 each side" },
        ],
      },
      {
        title: "Posterior Chain",
        tier: "compound",
        exercises: [
          { name: "Deadlift", target: "3–4 sets" },
          { name: "Hip Thrusters", target: "3 sets — stop short of full extension" },
          { name: "Single Leg Calf Raises", target: "2 sets" },
          { name: "Hip Abduction + IR/ER", target: "3 sets" },
          { name: "Hip Abduction Rainbow", target: "3 sets" },
        ],
      },
      {
        title: "Core",
        tier: "core",
        exercises: [
          { name: "Cable Chop, Low to High", target: "2 sets" },
          { name: "Hip Flexor Drive + Oblique Twist", target: "2 sets" },
          { name: "Stability Ball Figure 8s", target: "2 sets" },
          { name: "Ab Roll with Wheel", target: "2 sets" },
        ],
      },
      {
        title: "Upper Push",
        tier: "compound",
        exercises: [
          { name: "Push Ups", target: "3 sets" },
          { name: "Dumbbell Chest Press", target: "3 sets" },
          { name: "Wrist Flexion Curls", target: "2 sets — add back if elbow flares" },
          { name: "Cable Rows", target: "3 sets" },
          { name: "Reverse Fly", target: "2 sets" },
          { name: "Supermans (legs and arms)", target: "2 sets" },
        ],
      },
    ],
  },
};

export const ALL_EXERCISES = Array.from(
  new Set(
    Object.values(PROGRAM).flatMap((day) =>
      day.blocks.flatMap((b) => b.exercises.map((e) => e.name))
    )
  )
);

export function dayKeyForToday() {
  const d = new Date().getDay(); // 0 Sun ... 6 Sat
  if (d === 1) return "mon";
  if (d === 2) return "tue";
  if (d === 4) return "thu";
  return null; // no session today; caller decides fallback
}

export const REST_PRESETS = [60, 90, 120];
