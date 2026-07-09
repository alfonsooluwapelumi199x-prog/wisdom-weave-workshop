import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Pin = { name: string; cx: number; cy: number; delay: number };

const HERO_PINS: Pin[] = [
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

// Approximate equirectangular projection onto 480x480 SVG (world band cy 90..390)
const DISCOVERY_PINS: Pin[] = [
  { name: "Toronto", cx: 138, cy: 165, delay: 0 },
  { name: "Vancouver", cx: 108, cy: 158, delay: 0.3 },
  { name: "New York", cx: 152, cy: 178, delay: 0.6 },
  { name: "Mexico City", cx: 138, cy: 220, delay: 0.9 },
  { name: "São Paulo", cx: 195, cy: 285, delay: 1.2 },
  { name: "Buenos Aires", cx: 188, cy: 320, delay: 1.5 },
  { name: "London", cx: 236, cy: 152, delay: 1.8 },
  { name: "Dublin", cx: 228, cy: 150, delay: 2.1 },
  { name: "Paris", cx: 240, cy: 160, delay: 2.4 },
  { name: "Amsterdam", cx: 244, cy: 148, delay: 2.7 },
  { name: "Berlin", cx: 254, cy: 150, delay: 3.0 },
  { name: "Stockholm", cx: 262, cy: 128, delay: 3.3 },
  { name: "Lagos", cx: 244, cy: 248, delay: 3.6 },
  { name: "Accra", cx: 236, cy: 244, delay: 3.9 },
  { name: "Nairobi", cx: 284, cy: 262, delay: 4.2 },
  { name: "Johannesburg", cx: 274, cy: 305, delay: 4.5 },
  { name: "Dubai", cx: 302, cy: 208, delay: 4.8 },
  { name: "Doha", cx: 296, cy: 210, delay: 5.1 },
  { name: "Singapore", cx: 358, cy: 252, delay: 5.4 },
  { name: "Tokyo", cx: 396, cy: 182, delay: 5.7 },
  { name: "Seoul", cx: 384, cy: 178, delay: 6.0 },
  { name: "Sydney", cx: 400, cy: 312, delay: 6.3 },
  { name: "Melbourne", cx: 392, cy: 322, delay: 6.6 },
  { name: "Auckland", cx: 432, cy: 320, delay: 6.9 },
];

const HERO_ARCS: [string, string][] = [
  ["Canada", "Germany"],
  ["USA", "Singapore"],
  ["Brazil", "Ireland"],
  ["Sweden", "Japan"],
  ["Germany", "Australia"],
];

const DISCOVERY_ARCS: [string, string][] = [
  ["Toronto", "London"],
  ["São Paulo", "Lagos"],
  ["Stockholm", "Tokyo"],
  ["Dubai", "Sydney"],
  ["New York", "Paris"],
  ["Johannesburg", "Auckland"],
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
  mode = "hero",
  focusPins,
}: {
  compact?: boolean;
  highlighted?: string[];
  mode?: "hero" | "discovery";
  focusPins?: string[];
}) {
  const size = 480;
  const isDiscovery = mode === "discovery";
  const PINS = isDiscovery ? DISCOVERY_PINS : HERO_PINS;
  const ARCS = isDiscovery ? DISCOVERY_ARCS : HERO_ARCS;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;

  // Latitude / longitude lines
  const lats = useMemo(() => [-60, -30, 0, 30, 60], []);
  const lons = useMemo(() => [0, 30, 60, 90, 120, 150], []);

  // Particles orbiting
  const particleCount = isDiscovery ? 22 : 14;
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }).map((_, i) => ({
        i,
        delay: i * 0.7,
        dur: (isDiscovery ? 12 : 8) + (i % 4) * 2,
        color: i % 3 === 0 ? "var(--soft-white)" : "var(--lilac)",
      })),
    [particleCount, isDiscovery],
  );

  // Rolling illumination for discovery mode: rotate a small "active" subset
  const [activeSet, setActiveSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isDiscovery) return;
    let idx = 0;
    const pick = () => {
      const names = PINS.map((p) => p.name);
      const next = new Set<string>();
      for (let k = 0; k < 4; k++) next.add(names[(idx + k * 5) % names.length]);
      idx = (idx + 3) % names.length;
      setActiveSet(next);
    };
    pick();
    const id = setInterval(pick, 2200);
    return () => clearInterval(id);
  }, [isDiscovery, PINS]);

  // Rolling floating labels (5-6 at a time, fade in/out)
  const [visibleLabels, setVisibleLabels] = useState<string[]>([]);
  useEffect(() => {
    if (!isDiscovery) return;
    let idx = 0;
    const rotate = () => {
      const names = PINS.map((p) => p.name);
      const next: string[] = [];
      for (let k = 0; k < 6; k++) next.push(names[(idx + k * 4) % names.length]);
      idx = (idx + 2) % names.length;
      setVisibleLabels(next);
    };
    rotate();
    const id = setInterval(rotate, 2600);
    return () => clearInterval(id);
  }, [isDiscovery, PINS]);

  const focusSet = useMemo(
    () => (focusPins && focusPins.length ? new Set(focusPins) : null),
    [focusPins],
  );

  const labelsToShow = isDiscovery
    ? focusSet
      ? PINS.filter((p) => focusSet.has(p.name))
      : PINS.filter((p) => visibleLabels.includes(p.name))
    : [];

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
          const pa = PINS.find((p) => p.name === a);
          const pb = PINS.find((p) => p.name === b);
          if (!pa || !pb) return null;
          const dimmed = focusSet && !(focusSet.has(a) && focusSet.has(b));
          return (
            <motion.path
              key={`arc-${i}`}
              d={arcPath(pa, pb)}
              fill="none"
              stroke="url(#arcStroke)"
              strokeWidth={isDiscovery ? 1.2 : 1}
              strokeLinecap="round"
              strokeDasharray="4 8"
              initial={{ opacity: 0, strokeDashoffset: 60 }}
              animate={{
                opacity: dimmed ? 0.05 : [0, 0.9, 0],
                strokeDashoffset: [60, 0],
              }}
              transition={{
                duration: isDiscovery ? 8 : 6,
                delay: i * 1.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Pins */}
        {PINS.map((p) => {
          const isHighlighted = highlighted?.includes(p.name);
          const isFocused = focusSet ? focusSet.has(p.name) : false;
          const isActive = isDiscovery && (activeSet.has(p.name) || isFocused);
          const dim = focusSet && !isFocused ? 0.12 : 1;
          const glow = isActive || isHighlighted ? "url(#pinVioletGlow)" : "url(#pinGlow)";
          const dot = isActive || isHighlighted ? "var(--violet)" : "var(--lilac)";
          const baseR = isFocused ? 22 : isActive ? 18 : isHighlighted ? 18 : 14;
          return (
            <motion.g
              key={p.name}
              animate={{ opacity: dim }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <motion.circle
                cx={p.cx}
                cy={p.cy}
                r={baseR}
                fill={glow}
                animate={{
                  opacity: isActive ? [0.3, 0.95, 0.3] : [0.1, 0.5, 0.1],
                  scale: isActive ? [0.8, 1.5, 0.8] : [0.7, 1.15, 0.7],
                }}
                transition={{
                  duration: isActive ? 3 : 4,
                  delay: p.delay % 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}
              />
              <circle cx={p.cx} cy={p.cy} r={isFocused ? 3 : 2.2} fill={dot} />
            </motion.g>
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
              fill={p.color}
              initial={{ cx: x1, cy: y1, opacity: 0 }}
              animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 0.9, 0] }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
      </svg>

      {/* Floating city labels (discovery mode) */}
      {isDiscovery ? (
        <div className="pointer-events-none absolute inset-0">
          <AnimatePresence>
            {labelsToShow.map((p) => {
              const leftPct = (p.cx / size) * 100;
              const topPct = (p.cy / size) * 100;
              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute flex items-center gap-1.5"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: "translate(10px, -50%)",
                  }}
                >
                  <span
                    className="inline-block h-1 w-1 rounded-full"
                    style={{ background: "var(--violet)", boxShadow: "0 0 8px var(--violet)" }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                    {p.name}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}