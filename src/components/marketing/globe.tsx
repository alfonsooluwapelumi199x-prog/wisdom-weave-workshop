import { motion } from "framer-motion";
import { useMemo } from "react";

type Pin = { name: string; cx: number; cy: number; delay: number };

const DEFAULT_PINS: Pin[] = [
  { name: "Canada", cx: 130, cy: 150, delay: 0 },
  { name: "USA", cx: 155, cy: 195, delay: 0.4 },
  { name: "Ireland", cx: 232, cy: 148, delay: 0.8 },
  { name: "Sweden", cx: 265, cy: 128, delay: 1.2 },
  { name: "Germany", cx: 258, cy: 158, delay: 1.6 },
  { name: "UAE", cx: 300, cy: 210, delay: 2.0 },
  { name: "Japan", cx: 380, cy: 180, delay: 2.4 },
  { name: "Singapore", cx: 355, cy: 250, delay: 2.8 },
  { name: "Australia", cx: 370, cy: 305, delay: 3.2 },
  { name: "Brazil", cx: 180, cy: 285, delay: 3.6 },
];

const ARCS: [string, string][] = [
  ["Canada", "Germany"],
  ["USA", "Singapore"],
  ["Brazil", "Ireland"],
  ["Sweden", "Japan"],
  ["Germany", "Australia"],
];

function arcPath(a: Pin, b: Pin) {
  const mx = (a.cx + b.cx) / 2;
  const my = (a.cy + b.cy) / 2;
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const dist = Math.hypot(dx, dy);
  // perpendicular offset for a gentle curve
  const nx = -dy / dist;
  const ny = dx / dist;
  const lift = Math.min(dist * 0.35, 90);
  const cx = mx + nx * lift;
  const cy = my + ny * lift;
  return `M ${a.cx} ${a.cy} Q ${cx} ${cy} ${b.cx} ${b.cy}`;
}

export function Globe({
  compact = false,
  highlighted,
}: {
  compact?: boolean;
  highlighted?: string[];
}) {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;

  // Latitude / longitude lines
  const lats = useMemo(() => [-60, -30, 0, 30, 60], []);
  const lons = useMemo(() => [0, 30, 60, 90, 120, 150], []);

  // Particles orbiting
  const particles = useMemo(
    () => Array.from({ length: 14 }).map((_, i) => ({ i, delay: i * 0.7, dur: 8 + (i % 4) * 2 })),
    [],
  );

  return (
    <div className="relative h-full w-full">
      {/* Ambient glow behind globe */}
      <div className="pointer-events-none absolute inset-[-10%] rounded-full bg-[radial-gradient(circle_at_50%_50%,var(--violet)_0%,transparent_55%)] opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute inset-[5%] rounded-full bg-[radial-gradient(circle_at_50%_50%,var(--lilac)_0%,transparent_60%)] opacity-25 blur-2xl" />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="relative h-full w-full"
        role="img"
        aria-label="An animated globe showing global opportunities"
      >
        <defs>
          <radialGradient id="sphere" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="oklch(0.30 0.08 285)" />
            <stop offset="55%" stopColor="oklch(0.18 0.045 270)" />
            <stop offset="100%" stopColor="oklch(0.09 0.03 260)" />
          </radialGradient>
          <radialGradient id="rim" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="transparent" />
            <stop offset="97%" stopColor="var(--lilac)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--lilac)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--lilac)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pinVioletGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="arcStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--lilac)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--lilac)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0" />
          </linearGradient>
          <clipPath id="clip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Sphere */}
        <circle cx={cx} cy={cy} r={r} fill="url(#sphere)" />
        <circle cx={cx} cy={cy} r={r + 6} fill="url(#rim)" />

        {/* Rotating meridian/parallel group */}
        <g clipPath="url(#clip)" opacity="0.5">
          {/* Parallels — static ellipses */}
          {lats.map((lat) => {
            const rr = Math.cos((lat * Math.PI) / 180) * r;
            const y = cy + Math.sin((lat * Math.PI) / 180) * r;
            return (
              <ellipse
                key={`lat-${lat}`}
                cx={cx}
                cy={y}
                rx={rr}
                ry={rr * 0.18}
                fill="none"
                stroke="var(--lilac)"
                strokeOpacity="0.18"
                strokeWidth="0.6"
              />
            );
          })}

          {/* Meridians — rotate group slowly */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 90, ease: "linear", repeat: Infinity }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {lons.map((lon) => {
              const rx = Math.abs(Math.sin((lon * Math.PI) / 180)) * r;
              return (
                <ellipse
                  key={`lon-${lon}`}
                  cx={cx}
                  cy={cy}
                  rx={rx || 0.5}
                  ry={r}
                  fill="none"
                  stroke="var(--lilac)"
                  strokeOpacity="0.22"
                  strokeWidth="0.6"
                />
              );
            })}
          </motion.g>

          {/* Dotted grid overlay for depth */}
          <g opacity="0.35">
            {Array.from({ length: 220 }).map((_, i) => {
              const angle = (i * 137.5 * Math.PI) / 180;
              const rad = Math.sqrt(i / 220) * r * 0.95;
              const x = cx + Math.cos(angle) * rad;
              const y = cy + Math.sin(angle) * rad * 0.9;
              return <circle key={i} cx={x} cy={y} r={0.6} fill="var(--lilac)" />;
            })}
          </g>
        </g>

        {/* Arcs connecting pins */}
        {ARCS.map(([a, b], i) => {
          const pa = DEFAULT_PINS.find((p) => p.name === a);
          const pb = DEFAULT_PINS.find((p) => p.name === b);
          if (!pa || !pb) return null;
          return (
            <motion.path
              key={`arc-${i}`}
              d={arcPath(pa, pb)}
              fill="none"
              stroke="url(#arcStroke)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray="4 8"
              initial={{ opacity: 0, strokeDashoffset: 60 }}
              animate={{ opacity: [0, 0.9, 0], strokeDashoffset: [60, 0] }}
              transition={{
                duration: 6,
                delay: i * 1.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Pins */}
        {DEFAULT_PINS.map((p) => {
          const isHighlighted = highlighted?.includes(p.name);
          const glow = isHighlighted ? "url(#pinVioletGlow)" : "url(#pinGlow)";
          const dot = isHighlighted ? "var(--violet)" : "var(--lilac)";
          return (
            <g key={p.name}>
              <motion.circle
                cx={p.cx}
                cy={p.cy}
                r={isHighlighted ? 18 : 14}
                fill={glow}
                animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.7, 1.35, 0.7] }}
                transition={{ duration: 4, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}
              />
              <circle cx={p.cx} cy={p.cy} r={2.2} fill={dot} />
              {isHighlighted && !compact ? null : null}
            </g>
          );
        })}

        {/* Particles traveling between continents */}
        {particles.map((p) => {
          const startAngle = (p.i * 47) % 360;
          const endAngle = (startAngle + 140) % 360;
          const rad = r * (0.55 + (p.i % 5) * 0.07);
          const x1 = cx + Math.cos((startAngle * Math.PI) / 180) * rad;
          const y1 = cy + Math.sin((startAngle * Math.PI) / 180) * rad * 0.9;
          const x2 = cx + Math.cos((endAngle * Math.PI) / 180) * rad;
          const y2 = cy + Math.sin((endAngle * Math.PI) / 180) * rad * 0.9;
          return (
            <motion.circle
              key={`pt-${p.i}`}
              r={1.2}
              fill="var(--lilac)"
              initial={{ cx: x1, cy: y1, opacity: 0 }}
              animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 0.9, 0] }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
      </svg>
    </div>
  );
}