import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Pin = { name: string; cx: number; cy: number; delay: number };
type City = { name: string; lat: number; lon: number; region: Region };
type Region =
  | "NA"
  | "CA"
  | "CAR"
  | "SA"
  | "EU"
  | "ME"
  | "AF"
  | "AS"
  | "OC";

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

// Large city library — sampled at random each run.
const CITIES: City[] = [
  // North America
  { name: "Toronto", lat: 43.7, lon: -79.4, region: "NA" },
  { name: "Vancouver", lat: 49.3, lon: -123.1, region: "NA" },
  { name: "Montréal", lat: 45.5, lon: -73.6, region: "NA" },
  { name: "Calgary", lat: 51.0, lon: -114.1, region: "NA" },
  { name: "Ottawa", lat: 45.4, lon: -75.7, region: "NA" },
  { name: "New York", lat: 40.7, lon: -74.0, region: "NA" },
  { name: "San Francisco", lat: 37.8, lon: -122.4, region: "NA" },
  { name: "Los Angeles", lat: 34.0, lon: -118.2, region: "NA" },
  { name: "Seattle", lat: 47.6, lon: -122.3, region: "NA" },
  { name: "Chicago", lat: 41.9, lon: -87.6, region: "NA" },
  { name: "Boston", lat: 42.4, lon: -71.1, region: "NA" },
  { name: "Austin", lat: 30.3, lon: -97.7, region: "NA" },
  { name: "Miami", lat: 25.8, lon: -80.2, region: "NA" },
  { name: "Washington", lat: 38.9, lon: -77.0, region: "NA" },
  { name: "Denver", lat: 39.7, lon: -105.0, region: "NA" },
  { name: "Houston", lat: 29.8, lon: -95.4, region: "NA" },
  { name: "Atlanta", lat: 33.7, lon: -84.4, region: "NA" },
  // Central America / Caribbean
  { name: "Mexico City", lat: 19.4, lon: -99.1, region: "CA" },
  { name: "Guadalajara", lat: 20.7, lon: -103.3, region: "CA" },
  { name: "Monterrey", lat: 25.7, lon: -100.3, region: "CA" },
  { name: "San José", lat: 9.9, lon: -84.1, region: "CA" },
  { name: "Panama City", lat: 8.9, lon: -79.5, region: "CA" },
  { name: "Guatemala City", lat: 14.6, lon: -90.5, region: "CA" },
  { name: "Havana", lat: 23.1, lon: -82.4, region: "CAR" },
  { name: "San Juan", lat: 18.5, lon: -66.1, region: "CAR" },
  { name: "Kingston", lat: 18.0, lon: -76.8, region: "CAR" },
  { name: "Santo Domingo", lat: 18.5, lon: -69.9, region: "CAR" },
  { name: "Nassau", lat: 25.1, lon: -77.4, region: "CAR" },
  { name: "Bridgetown", lat: 13.1, lon: -59.6, region: "CAR" },
  // South America
  { name: "São Paulo", lat: -23.5, lon: -46.6, region: "SA" },
  { name: "Rio de Janeiro", lat: -22.9, lon: -43.2, region: "SA" },
  { name: "Brasília", lat: -15.8, lon: -47.9, region: "SA" },
  { name: "Buenos Aires", lat: -34.6, lon: -58.4, region: "SA" },
  { name: "Santiago", lat: -33.4, lon: -70.7, region: "SA" },
  { name: "Lima", lat: -12.0, lon: -77.0, region: "SA" },
  { name: "Bogotá", lat: 4.7, lon: -74.1, region: "SA" },
  { name: "Medellín", lat: 6.2, lon: -75.6, region: "SA" },
  { name: "Quito", lat: -0.2, lon: -78.5, region: "SA" },
  { name: "Caracas", lat: 10.5, lon: -66.9, region: "SA" },
  { name: "Montevideo", lat: -34.9, lon: -56.2, region: "SA" },
  { name: "La Paz", lat: -16.5, lon: -68.1, region: "SA" },
  { name: "Asunción", lat: -25.3, lon: -57.6, region: "SA" },
  // Europe
  { name: "London", lat: 51.5, lon: -0.1, region: "EU" },
  { name: "Manchester", lat: 53.5, lon: -2.2, region: "EU" },
  { name: "Edinburgh", lat: 55.9, lon: -3.2, region: "EU" },
  { name: "Dublin", lat: 53.3, lon: -6.3, region: "EU" },
  { name: "Paris", lat: 48.9, lon: 2.4, region: "EU" },
  { name: "Lyon", lat: 45.8, lon: 4.9, region: "EU" },
  { name: "Amsterdam", lat: 52.4, lon: 4.9, region: "EU" },
  { name: "Rotterdam", lat: 51.9, lon: 4.5, region: "EU" },
  { name: "Brussels", lat: 50.8, lon: 4.4, region: "EU" },
  { name: "Berlin", lat: 52.5, lon: 13.4, region: "EU" },
  { name: "Munich", lat: 48.1, lon: 11.6, region: "EU" },
  { name: "Hamburg", lat: 53.5, lon: 10.0, region: "EU" },
  { name: "Frankfurt", lat: 50.1, lon: 8.7, region: "EU" },
  { name: "Zürich", lat: 47.4, lon: 8.5, region: "EU" },
  { name: "Geneva", lat: 46.2, lon: 6.1, region: "EU" },
  { name: "Vienna", lat: 48.2, lon: 16.4, region: "EU" },
  { name: "Prague", lat: 50.1, lon: 14.4, region: "EU" },
  { name: "Warsaw", lat: 52.2, lon: 21.0, region: "EU" },
  { name: "Kraków", lat: 50.1, lon: 19.9, region: "EU" },
  { name: "Budapest", lat: 47.5, lon: 19.1, region: "EU" },
  { name: "Bucharest", lat: 44.4, lon: 26.1, region: "EU" },
  { name: "Copenhagen", lat: 55.7, lon: 12.6, region: "EU" },
  { name: "Stockholm", lat: 59.3, lon: 18.1, region: "EU" },
  { name: "Oslo", lat: 59.9, lon: 10.7, region: "EU" },
  { name: "Helsinki", lat: 60.2, lon: 24.9, region: "EU" },
  { name: "Tallinn", lat: 59.4, lon: 24.7, region: "EU" },
  { name: "Reykjavík", lat: 64.1, lon: -21.9, region: "EU" },
  { name: "Madrid", lat: 40.4, lon: -3.7, region: "EU" },
  { name: "Barcelona", lat: 41.4, lon: 2.2, region: "EU" },
  { name: "Valencia", lat: 39.5, lon: -0.4, region: "EU" },
  { name: "Lisbon", lat: 38.7, lon: -9.1, region: "EU" },
  { name: "Porto", lat: 41.1, lon: -8.6, region: "EU" },
  { name: "Rome", lat: 41.9, lon: 12.5, region: "EU" },
  { name: "Milan", lat: 45.5, lon: 9.2, region: "EU" },
  { name: "Athens", lat: 38.0, lon: 23.7, region: "EU" },
  { name: "Istanbul", lat: 41.0, lon: 28.9, region: "EU" },
  // Middle East
  { name: "Dubai", lat: 25.2, lon: 55.3, region: "ME" },
  { name: "Abu Dhabi", lat: 24.5, lon: 54.4, region: "ME" },
  { name: "Doha", lat: 25.3, lon: 51.5, region: "ME" },
  { name: "Riyadh", lat: 24.7, lon: 46.7, region: "ME" },
  { name: "Jeddah", lat: 21.5, lon: 39.2, region: "ME" },
  { name: "Kuwait City", lat: 29.4, lon: 48.0, region: "ME" },
  { name: "Manama", lat: 26.2, lon: 50.6, region: "ME" },
  { name: "Muscat", lat: 23.6, lon: 58.5, region: "ME" },
  { name: "Amman", lat: 32.0, lon: 35.9, region: "ME" },
  { name: "Beirut", lat: 33.9, lon: 35.5, region: "ME" },
  { name: "Tel Aviv", lat: 32.1, lon: 34.8, region: "ME" },
  { name: "Tehran", lat: 35.7, lon: 51.4, region: "ME" },
  // Africa
  { name: "Cairo", lat: 30.0, lon: 31.2, region: "AF" },
  { name: "Alexandria", lat: 31.2, lon: 29.9, region: "AF" },
  { name: "Casablanca", lat: 33.6, lon: -7.6, region: "AF" },
  { name: "Rabat", lat: 34.0, lon: -6.8, region: "AF" },
  { name: "Tunis", lat: 36.8, lon: 10.2, region: "AF" },
  { name: "Algiers", lat: 36.8, lon: 3.1, region: "AF" },
  { name: "Lagos", lat: 6.5, lon: 3.4, region: "AF" },
  { name: "Abuja", lat: 9.1, lon: 7.5, region: "AF" },
  { name: "Accra", lat: 5.6, lon: -0.2, region: "AF" },
  { name: "Dakar", lat: 14.7, lon: -17.5, region: "AF" },
  { name: "Abidjan", lat: 5.3, lon: -4.0, region: "AF" },
  { name: "Kigali", lat: -1.9, lon: 30.1, region: "AF" },
  { name: "Nairobi", lat: -1.3, lon: 36.8, region: "AF" },
  { name: "Dar es Salaam", lat: -6.8, lon: 39.3, region: "AF" },
  { name: "Kampala", lat: 0.3, lon: 32.6, region: "AF" },
  { name: "Addis Ababa", lat: 9.0, lon: 38.8, region: "AF" },
  { name: "Johannesburg", lat: -26.2, lon: 28.0, region: "AF" },
  { name: "Cape Town", lat: -33.9, lon: 18.4, region: "AF" },
  { name: "Pretoria", lat: -25.7, lon: 28.2, region: "AF" },
  { name: "Windhoek", lat: -22.6, lon: 17.1, region: "AF" },
  { name: "Luanda", lat: -8.8, lon: 13.2, region: "AF" },
  { name: "Harare", lat: -17.8, lon: 31.0, region: "AF" },
  // Asia
  { name: "Tokyo", lat: 35.7, lon: 139.7, region: "AS" },
  { name: "Osaka", lat: 34.7, lon: 135.5, region: "AS" },
  { name: "Kyoto", lat: 35.0, lon: 135.8, region: "AS" },
  { name: "Seoul", lat: 37.6, lon: 127.0, region: "AS" },
  { name: "Busan", lat: 35.2, lon: 129.1, region: "AS" },
  { name: "Beijing", lat: 39.9, lon: 116.4, region: "AS" },
  { name: "Shanghai", lat: 31.2, lon: 121.5, region: "AS" },
  { name: "Shenzhen", lat: 22.5, lon: 114.1, region: "AS" },
  { name: "Guangzhou", lat: 23.1, lon: 113.3, region: "AS" },
  { name: "Hong Kong", lat: 22.3, lon: 114.2, region: "AS" },
  { name: "Taipei", lat: 25.0, lon: 121.5, region: "AS" },
  { name: "Singapore", lat: 1.4, lon: 103.8, region: "AS" },
  { name: "Kuala Lumpur", lat: 3.1, lon: 101.7, region: "AS" },
  { name: "Jakarta", lat: -6.2, lon: 106.8, region: "AS" },
  { name: "Bali", lat: -8.4, lon: 115.2, region: "AS" },
  { name: "Manila", lat: 14.6, lon: 121.0, region: "AS" },
  { name: "Bangkok", lat: 13.8, lon: 100.5, region: "AS" },
  { name: "Ho Chi Minh City", lat: 10.8, lon: 106.7, region: "AS" },
  { name: "Hanoi", lat: 21.0, lon: 105.8, region: "AS" },
  { name: "Phnom Penh", lat: 11.6, lon: 104.9, region: "AS" },
  { name: "Colombo", lat: 6.9, lon: 79.9, region: "AS" },
  { name: "Mumbai", lat: 19.1, lon: 72.9, region: "AS" },
  { name: "Delhi", lat: 28.6, lon: 77.2, region: "AS" },
  { name: "Bengaluru", lat: 13.0, lon: 77.6, region: "AS" },
  { name: "Hyderabad", lat: 17.4, lon: 78.5, region: "AS" },
  { name: "Chennai", lat: 13.1, lon: 80.3, region: "AS" },
  { name: "Kolkata", lat: 22.6, lon: 88.4, region: "AS" },
  { name: "Karachi", lat: 24.9, lon: 67.0, region: "AS" },
  { name: "Islamabad", lat: 33.7, lon: 73.1, region: "AS" },
  { name: "Lahore", lat: 31.6, lon: 74.3, region: "AS" },
  { name: "Dhaka", lat: 23.8, lon: 90.4, region: "AS" },
  { name: "Kathmandu", lat: 27.7, lon: 85.3, region: "AS" },
  { name: "Almaty", lat: 43.2, lon: 76.9, region: "AS" },
  { name: "Tashkent", lat: 41.3, lon: 69.3, region: "AS" },
  { name: "Baku", lat: 40.4, lon: 49.9, region: "AS" },
  { name: "Tbilisi", lat: 41.7, lon: 44.8, region: "AS" },
  // Oceania
  { name: "Sydney", lat: -33.9, lon: 151.2, region: "OC" },
  { name: "Melbourne", lat: -37.8, lon: 145.0, region: "OC" },
  { name: "Brisbane", lat: -27.5, lon: 153.0, region: "OC" },
  { name: "Perth", lat: -31.9, lon: 115.9, region: "OC" },
  { name: "Adelaide", lat: -34.9, lon: 138.6, region: "OC" },
  { name: "Canberra", lat: -35.3, lon: 149.1, region: "OC" },
  { name: "Auckland", lat: -36.8, lon: 174.8, region: "OC" },
  { name: "Wellington", lat: -41.3, lon: 174.8, region: "OC" },
  { name: "Christchurch", lat: -43.5, lon: 172.6, region: "OC" },
  { name: "Suva", lat: -18.1, lon: 178.4, region: "OC" },
];

// Cities that map plausibly to premium destinations for the focus phase.
const FOCUS_POOL = [
  "Toronto",
  "Vancouver",
  "Montréal",
  "London",
  "Manchester",
  "Edinburgh",
  "Dublin",
  "Berlin",
  "Munich",
  "Amsterdam",
  "Stockholm",
  "Copenhagen",
  "Oslo",
  "Helsinki",
  "Zürich",
  "Dubai",
  "Abu Dhabi",
  "Singapore",
  "Tokyo",
  "Sydney",
  "Melbourne",
  "Auckland",
  "Wellington",
  "New York",
  "Boston",
];

// Deterministic-per-run PRNG so a single mount stays coherent while every
// mount looks different.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Project lat/lon onto the 480x480 SVG so points sit inside the visible disc.
function project(lat: number, lon: number): { x: number; y: number } {
  return { x: 240 + lon * 0.95, y: 240 - lat * 1.55 };
}

const CENTER = 240;
const DISC_R = 220;

function inDisc(x: number, y: number, pad = 6) {
  const dx = x - CENTER;
  const dy = y - CENTER;
  return dx * dx + dy * dy <= (DISC_R - pad) * (DISC_R - pad);
}

// Precompute projected library once.
const PROJECTED: Array<Pin & { region: Region }> = CITIES.map((c, i) => {
  const { x, y } = project(c.lat, c.lon);
  return { name: c.name, cx: x, cy: y, delay: (i % 8) * 0.35, region: c.region };
}).filter((p) => inDisc(p.cx, p.cy));

const HERO_ARCS: [string, string][] = [
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

// Sample points along the quadratic bezier used by arcPath for the pulse.
function samplePath(a: Pin, b: Pin, steps = 24): Array<{ x: number; y: number }> {
  const mx = (a.cx + b.cx) / 2;
  const my = (a.cy + b.cy) / 2;
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const dist = Math.hypot(dx, dy);
  const nx = -dy / dist;
  const ny = dx / dist;
  const lift = Math.min(dist * 0.35, 90);
  const cx = mx + nx * lift;
  const cy = my + ny * lift;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const it = 1 - t;
    pts.push({
      x: it * it * a.cx + 2 * it * t * cx + t * t * b.cx,
      y: it * it * a.cy + 2 * it * t * cy + t * t * b.cy,
    });
  }
  return pts;
}

// Sample K unique items from an array using a seeded RNG.
function sample<T>(items: readonly T[], k: number, rng: () => number): T[] {
  const pool = items.slice();
  const out: T[] = [];
  const take = Math.min(k, pool.length);
  for (let i = 0; i < take; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
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
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;

  // Latitude / longitude lines
  const lats = useMemo(() => [-60, -30, 0, 30, 60], []);
  const lons = useMemo(() => [0, 30, 60, 90, 120, 150], []);

  // Discovery mode gets the giant randomised world; hero keeps the curated pins.
  if (isDiscovery) {
    return (
      <DiscoveryGlobe
        size={size}
        cx={cx}
        cy={cy}
        r={r}
        lats={lats}
        lons={lons}
        focusPins={focusPins}
        highlighted={highlighted}
      />
    );
  }

  const PINS = HERO_PINS;
  const ARCS = HERO_ARCS;
  const particleCount = 14;
  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    i,
    delay: i * 0.7,
    dur: 8 + (i % 4) * 2,
    color: i % 3 === 0 ? "var(--soft-white)" : "var(--lilac)",
  }));
  const focusSet = focusPins && focusPins.length ? new Set(focusPins) : null;

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
              strokeWidth={1}
              strokeLinecap="round"
              strokeDasharray="4 8"
              initial={{ opacity: 0, strokeDashoffset: 60 }}
              animate={{
                opacity: dimmed ? 0.05 : [0, 0.9, 0],
                strokeDashoffset: [60, 0],
              }}
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
        {PINS.map((p) => {
          const isHighlighted = highlighted?.includes(p.name);
          const isFocused = focusSet ? focusSet.has(p.name) : false;
          const isActive = isFocused;
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Discovery globe: signature "Searching the World" experience.
// ---------------------------------------------------------------------------

const REGION_CENTERS: Record<Region, { x: number; y: number; r: number }> = {
  NA: { x: 140, y: 175, r: 110 },
  CA: { x: 155, y: 220, r: 65 },
  CAR: { x: 175, y: 220, r: 55 },
  SA: { x: 190, y: 300, r: 90 },
  EU: { x: 250, y: 155, r: 85 },
  ME: { x: 285, y: 205, r: 70 },
  AF: { x: 260, y: 275, r: 100 },
  AS: { x: 340, y: 200, r: 130 },
  OC: { x: 385, y: 305, r: 90 },
};

const ALL_REGIONS: Region[] = ["NA", "CA", "CAR", "SA", "EU", "ME", "AF", "AS", "OC"];

type ActivePin = Pin & { region: Region; id: number };
type Pulse = {
  id: number;
  points: Array<{ x: number; y: number }>;
  arcD: string;
  duration: number;
  color: string;
};

function DiscoveryGlobe({
  size,
  cx,
  cy,
  r,
  lats,
  lons,
  focusPins,
  highlighted,
}: {
  size: number;
  cx: number;
  cy: number;
  r: number;
  lats: number[];
  lons: number[];
  focusPins?: string[];
  highlighted?: string[];
}) {
  // Per-mount seed → different search every time, stable within one run.
  const rngRef = useRef<() => number>(mulberry32(Math.floor(Math.random() * 2 ** 31)));
  const rng = rngRef.current;

  // Rolling window of visible pins across the world.
  const [activePins, setActivePins] = useState<ActivePin[]>(() =>
    initialActivePins(rng),
  );
  const nextIdRef = useRef(activePins.length);

  useEffect(() => {
    const id = setInterval(() => {
      setActivePins((prev) => {
        // Drop ~6 oldest and add ~6 fresh ones, keeping regional variety.
        const keep = prev.slice(6);
        const currentNames = new Set(keep.map((p) => p.name));
        const wantRegions = sample(ALL_REGIONS, 6, rng);
        const fresh: ActivePin[] = [];
        for (const region of wantRegions) {
          const pool = PROJECTED.filter(
            (p) => p.region === region && !currentNames.has(p.name),
          );
          if (!pool.length) continue;
          const pick = pool[Math.floor(rng() * pool.length)];
          fresh.push({ ...pick, id: nextIdRef.current++ });
          currentNames.add(pick.name);
        }
        return [...keep, ...fresh].slice(-40);
      });
    }, 1600);
    return () => clearInterval(id);
  }, [rng]);

  // Region glow washes — one region lights up softly, others follow.
  const [regionWash, setRegionWash] = useState<Region>("EU");
  const [washKey, setWashKey] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setRegionWash(ALL_REGIONS[Math.floor(rng() * ALL_REGIONS.length)]);
      setWashKey((k) => k + 1);
    }, 2500);
    return () => clearInterval(id);
  }, [rng]);

  // Opportunity Pulse — two independent traveling dots.
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const pulseIdRef = useRef(0);

  useEffect(() => {
    const spawn = (color: string, dur: number) => {
      const pool = activePins.length >= 2 ? activePins : PROJECTED;
      if (pool.length < 2) return;
      const a = pool[Math.floor(rng() * pool.length)];
      let b = pool[Math.floor(rng() * pool.length)];
      let guard = 0;
      while (b.name === a.name && guard++ < 6) {
        b = pool[Math.floor(rng() * pool.length)];
      }
      const p: Pulse = {
        id: pulseIdRef.current++,
        points: samplePath(a, b, 28),
        arcD: arcPath(a, b),
        duration: dur,
        color,
      };
      setPulses((prev) => [...prev.slice(-4), p]);
      // Retire pulse trail slightly after its motion ends.
      setTimeout(
        () => setPulses((prev) => prev.filter((x) => x.id !== p.id)),
        (dur + 1.6) * 1000,
      );
    };

    // Kick off immediately, then stagger two pulses on different cadences.
    spawn("var(--violet)", 1.4);
    const idA = setInterval(() => spawn("var(--violet)", 1.4), 1400);
    const idB = setInterval(() => spawn("var(--lilac)", 1.9), 1900);
    return () => {
      clearInterval(idA);
      clearInterval(idB);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rng]);

  const focusSet = useMemo(
    () => (focusPins && focusPins.length ? new Set(focusPins) : null),
    [focusPins],
  );

  // Focus phase: augment active pins with the focus-set (from a premium pool
  // chosen per-run) so they always render and stay bright while the world dims.
  const focusPinsResolved = useMemo(() => {
    if (!focusSet) return [] as ActivePin[];
    const chosen = sample(FOCUS_POOL, 5, rng);
    const set = new Set([...focusSet, ...chosen]);
    return PROJECTED.filter((p) => set.has(p.name)).map((p, i) => ({
      ...p,
      id: 900_000 + i,
    }));
  }, [focusSet, rng]);

  // Merge active + focus (focus pins take precedence).
  const pinsToRender = useMemo(() => {
    const map = new Map<string, ActivePin>();
    for (const p of activePins) map.set(p.name, p);
    for (const p of focusPinsResolved) map.set(p.name, p);
    return Array.from(map.values());
  }, [activePins, focusPinsResolved]);

  // Orbiting particles.
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        i,
        delay: i * 0.6,
        dur: 12 + (i % 4) * 2,
        color: i % 3 === 0 ? "var(--soft-white)" : "var(--lilac)",
      })),
    [],
  );

  const wash = REGION_CENTERS[regionWash];

  return (
    <div className="relative h-full w-full">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-[-10%] rounded-full bg-[radial-gradient(circle_at_50%_50%,var(--violet)_0%,transparent_55%)] opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute inset-[5%] rounded-full bg-[radial-gradient(circle_at_50%_50%,var(--lilac)_0%,transparent_60%)] opacity-25 blur-2xl" />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="relative h-full w-full"
        role="img"
        aria-label="Searching the world for opportunities"
      >
        <defs>
          <radialGradient id="sphere-d" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="oklch(0.30 0.08 285)" />
            <stop offset="55%" stopColor="oklch(0.18 0.045 270)" />
            <stop offset="100%" stopColor="oklch(0.09 0.03 260)" />
          </radialGradient>
          <radialGradient id="rim-d" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="transparent" />
            <stop offset="97%" stopColor="var(--lilac)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="pinGlow-d" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--lilac)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--lilac)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pinVioletGlow-d" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="washGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--lilac)" stopOpacity="0.55" />
            <stop offset="70%" stopColor="var(--violet)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="arcStroke-d" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--lilac)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--lilac)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pulseTrail" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--violet)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--lilac)" stopOpacity="0" />
          </linearGradient>
          <clipPath id="clip-d">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Sphere */}
        <circle cx={cx} cy={cy} r={r} fill="url(#sphere-d)" />
        <circle cx={cx} cy={cy} r={r + 6} fill="url(#rim-d)" />

        {/* Meridians + parallels */}
        <g clipPath="url(#clip-d)" opacity="0.5">
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
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 120, ease: "linear", repeat: Infinity }}
            style={{ transformOrigin: `${cx}px ${cy}px`, willChange: "transform" }}
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

        {/* Region wash — soft glow that sweeps across regions */}
        <g clipPath="url(#clip-d)">
          <motion.circle
            key={washKey}
            cx={wash.x}
            cy={wash.y}
            r={wash.r}
            fill="url(#washGrad)"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.6, 1.15, 1.3] }}
            transition={{ duration: 2.6, ease: "easeOut" }}
            style={{ transformOrigin: `${wash.x}px ${wash.y}px` }}
          />
        </g>

        {/* Pulse trails (fading arcs left behind each pulse leg) */}
        <g clipPath="url(#clip-d)">
          {pulses.map((p) => (
            <motion.path
              key={`trail-${p.id}`}
              d={p.arcD}
              fill="none"
              stroke="url(#pulseTrail)"
              strokeWidth={1.2}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0] }}
              transition={{ duration: p.duration + 1.4, ease: "easeInOut" }}
            />
          ))}
        </g>

        {/* Active pins across the whole world */}
        <AnimatePresence>
          {pinsToRender.map((p) => {
            const isFocused = focusSet ? focusSet.has(p.name) : false;
            const isHighlighted = highlighted?.includes(p.name);
            const isPremium = FOCUS_POOL.includes(p.name);
            const isBright =
              isFocused ||
              isHighlighted ||
              (!!focusSet && focusPinsResolved.some((f) => f.name === p.name));
            const dim = focusSet && !isBright ? 0.12 : 1;
            const glow =
              isBright || isPremium ? "url(#pinVioletGlow-d)" : "url(#pinGlow-d)";
            const dot = isBright ? "var(--violet)" : "var(--lilac)";
            const baseR = isFocused ? 22 : isBright ? 18 : 14;
            return (
              <motion.g
                key={`${p.name}-${p.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: dim }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                <motion.circle
                  cx={p.cx}
                  cy={p.cy}
                  r={baseR}
                  fill={glow}
                  animate={{
                    opacity: isBright ? [0.4, 0.95, 0.4] : [0.15, 0.55, 0.15],
                    scale: isBright ? [0.9, 1.6, 0.9] : [0.7, 1.2, 0.7],
                  }}
                  transition={{
                    duration: isBright ? 3 : 4,
                    delay: (p.id % 5) * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}
                />
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={isFocused ? 3 : 2.2}
                  fill={dot}
                />
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Opportunity Pulses — glowing dots traveling across the globe */}
        {pulses.map((p) => (
          <motion.circle
            key={`pulse-${p.id}`}
            r={3.2}
            fill={p.color}
            style={{
              filter: `drop-shadow(0 0 6px ${p.color}) drop-shadow(0 0 14px ${p.color})`,
            }}
            initial={{ cx: p.points[0].x, cy: p.points[0].y, opacity: 0 }}
            animate={{
              cx: p.points.map((pt) => pt.x),
              cy: p.points.map((pt) => pt.y),
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: p.duration, ease: "easeInOut" }}
          />
        ))}

        {/* Orbiting particles */}
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
              transition={{
                duration: p.dur,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>

      {/* Floating city labels — always ~8 visible, drawn from currently-lit pins */}
      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {pinsToRender.slice(-10).map((p) => {
            const leftPct = (p.cx / size) * 100;
            const topPct = (p.cy / size) * 100;
            const isFocused = focusSet ? focusSet.has(p.name) : false;
            return (
              <motion.div
                key={`label-${p.name}-${p.id}`}
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
                  style={{
                    background: isFocused ? "var(--violet)" : "var(--lilac)",
                    boxShadow: isFocused
                      ? "0 0 10px var(--violet)"
                      : "0 0 6px var(--lilac)",
                  }}
                />
                <span
                  className={`text-[10px] uppercase tracking-[0.22em] ${
                    isFocused ? "text-foreground/85" : "text-foreground/55"
                  }`}
                >
                  {p.name}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function initialActivePins(rng: () => number): ActivePin[] {
  const out: ActivePin[] = [];
  let id = 0;
  for (const region of ALL_REGIONS) {
    const pool = PROJECTED.filter((p) => p.region === region);
    const picks = sample(pool, 4, rng);
    for (const pick of picks) out.push({ ...pick, id: id++ });
  }
  return out;
}