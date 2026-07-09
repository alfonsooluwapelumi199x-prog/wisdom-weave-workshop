import { motion } from "framer-motion";
import { useMemo } from "react";

type Pin = { name: string; cx: number; cy: number; delay: number };

const DEFAULT_PINS: Pin[] = [
  { name: "Canada", cx: 130, cy: 150, delay: 0 },
  { name: "Germany", cx: 260, cy: 155, delay: 0.6 },
  { name: "Ireland", cx: 232, cy: 148, delay: 1.2 },
  { name: "Sweden", cx: 265, cy: 130, delay: 1.8 },
  { name: "Australia", cx: 355, cy: 300, delay: 2.4 },
  { name: "Japan", cx: 380, cy: 180, delay: 3.0 },
  { name: "Brazil", cx: 175, cy: 285, delay: 3.6 },
];

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
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,var(--primary)/0.25,transparent_60%)] blur-2xl" />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="relative h-full w-full"
        role="img"
        aria-label="An animated globe showing global opportunities"
      >
        <defs>
          <radialGradient id="sphere" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="oklch(0.32 0.06 220)" />
            <stop offset="55%" stopColor="oklch(0.20 0.05 260)" />
            <stop offset="100%" stopColor="oklch(0.10 0.04 260)" />
          </radialGradient>
          <radialGradient id="rim" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="98%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pinGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
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
                stroke="oklch(0.78 0.15 195)"
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
                  stroke="oklch(0.78 0.15 195)"
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
              return <circle key={i} cx={x} cy={y} r={0.6} fill="oklch(0.78 0.15 195)" />;
            })}
          </g>
        </g>

        {/* Pins */}
        {DEFAULT_PINS.map((p) => {
          const isHighlighted = highlighted?.includes(p.name);
          const glow = isHighlighted ? "url(#pinGold)" : "url(#pinGlow)";
          const dot = isHighlighted ? "var(--gold)" : "var(--primary)";
          return (
            <g key={p.name}>
              <motion.circle
                cx={p.cx}
                cy={p.cy}
                r={14}
                fill={glow}
                animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 3.5, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}
              />
              <circle cx={p.cx} cy={p.cy} r={2.4} fill={dot} />
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
              fill="var(--primary)"
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