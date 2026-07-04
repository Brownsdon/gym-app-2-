import { useMemo, useState } from "react";

// Sparkline geometry: fixed viewBox scaled non-uniformly to fill the tile.
// Strokes use non-scaling-stroke so line weight stays constant; dots are
// drawn as zero-length round-capped strokes so they stay circular.
const VB_W = 100;
const VB_H = 56;
const PAD_X = 4;
const PAD_Y = 8;

function fmtShort(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Collapse the raw log into one series per exercise (oldest → newest,
// last 12 points, single unit so a line never mixes lb with reps).
function buildSeries(entries) {
  const byName = new Map();
  for (const e of entries) {
    let value = null;
    let unit = null;
    if (e.weight != null) [value, unit] = [e.weight, "lb"];
    else if (e.reps != null) [value, unit] = [e.reps, "reps"];
    else if (e.rpe != null) [value, unit] = [e.rpe, "RPE"];
    if (value == null) continue;
    if (!byName.has(e.exerciseName)) byName.set(e.exerciseName, []);
    byName.get(e.exerciseName).push({ date: e.date, value, unit });
  }

  const series = [];
  for (const [name, pts] of byName) {
    pts.reverse();
    const unit = pts[pts.length - 1].unit;
    const points = pts.filter((p) => p.unit === unit).slice(-12);
    series.push({ name, unit, points });
  }
  series.sort(
    (a, b) =>
      new Date(b.points[b.points.length - 1].date) - new Date(a.points[a.points.length - 1].date)
  );
  return series;
}

function toCoords(points) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return points.map((p, i) => ({
    x: points.length === 1 ? VB_W / 2 : PAD_X + (i / (points.length - 1)) * (VB_W - PAD_X * 2),
    y: max === min ? VB_H / 2 : PAD_Y + (1 - (p.value - min) / span) * (VB_H - PAD_Y * 2),
  }));
}

function Sparkline({ points, unit }) {
  const [hover, setHover] = useState(null);
  const coords = useMemo(() => toCoords(points), [points]);
  const last = coords[coords.length - 1];
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x} ${c.y}`).join(" ");

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const x = frac * VB_W;
    let nearest = 0;
    for (let i = 1; i < coords.length; i++) {
      if (Math.abs(coords[i].x - x) < Math.abs(coords[nearest].x - x)) nearest = i;
    }
    setHover(nearest);
  }

  const hoverPoint = hover != null ? points[hover] : null;
  const hoverCoord = hover != null ? coords[hover] : null;

  return (
    <div className="spark-wrap">
      {hoverPoint && (
        <div
          className="spark-tooltip"
          style={{ left: `${Math.min(85, Math.max(15, (hoverCoord.x / VB_W) * 100))}%` }}
        >
          {hoverPoint.value} {unit} · {fmtShort(hoverPoint.date)}
        </div>
      )}
      <svg
        className="spark"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Trend, ${points.length} sessions, latest ${points[points.length - 1].value} ${unit}`}
      >
        {points.length > 1 && <path className="spark-line" d={linePath} />}
        {hoverCoord && hover !== coords.length - 1 && (
          <path
            className="spark-hover-dot"
            d={`M${hoverCoord.x} ${hoverCoord.y} L${hoverCoord.x} ${hoverCoord.y}`}
          />
        )}
        <path className="spark-end-ring" d={`M${last.x} ${last.y} L${last.x} ${last.y}`} />
        <path className="spark-end-dot" d={`M${last.x} ${last.y} L${last.x} ${last.y}`} />
      </svg>
    </div>
  );
}

function StatTile({ series }) {
  const { name, unit, points } = series;
  const latest = points[points.length - 1];
  const first = points[0];
  const delta = latest.value - first.value;
  // More weight or reps is progress; a higher RPE isn't, so keep it neutral.
  const deltaClass =
    unit === "RPE" || delta === 0 ? "stat-delta-flat" : delta > 0 ? "stat-delta-up" : "stat-delta-down";

  return (
    <div className="stat-tile">
      <div className="stat-label">{name}</div>
      <div className="stat-value">
        {latest.value} <span className="stat-unit">{unit}</span>
      </div>
      {points.length > 1 ? (
        <div className={`stat-delta ${deltaClass}`}>
          {delta === 0
            ? `No change since ${fmtShort(first.date)}`
            : `${delta > 0 ? "+" : ""}${delta} ${unit} since ${fmtShort(first.date)}`}
        </div>
      ) : (
        <div className="stat-delta stat-delta-flat">First entry · {fmtShort(latest.date)}</div>
      )}
      <Sparkline points={points} unit={unit} />
      <div className="stat-count">
        {points.length} session{points.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

export default function ProgressView({ entries }) {
  const series = useMemo(() => buildSeries(entries), [entries]);

  if (series.length === 0) {
    return (
      <p className="empty-state">
        Nothing to chart yet. Log a weight, reps, or an interval session and trends will show up
        here.
      </p>
    );
  }

  return <div className="stat-grid">{series.map((s) => <StatTile key={s.name} series={s} />)}</div>;
}
