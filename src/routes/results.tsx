import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, GraduationCap, Award } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [{ title: "Your Opportunities · ForMe" }] }),
  component: Results,
});

type Pending = {
  country_of_residence?: string;
  nationality?: string;
  qualification?: string;
  profession?: string;
  occupation?: string;
  main_goal?: string;
  countries_of_interest?: string[];
};

// Palette (light, premium)
const C = {
  bg: "#FFFFFF",
  bg2: "#F8F5FF",
  accent: "#C8B6FF",
  accent2: "#A78BFA",
  primary: "#8B5CF6",
  success: "#10B981",
  text: "#1E1E2E",
  muted: "#6B7280",
};

type Card = {
  id: string;
  kind: "work" | "study" | "scholarship";
  flag?: string;
  country?: string;
  title: string;
  matchStrength?: "Strong Match" | "Good Match" | "Emerging";
  tagline: string;
};

const WORK: Card[] = [
  { id: "work-ca", kind: "work", flag: "🇨🇦", country: "Canada", title: "Canada", matchStrength: "Strong Match", tagline: "Healthcare roles actively recruiting internationally." },
  { id: "work-de", kind: "work", flag: "🇩🇪", country: "Germany", title: "Germany", matchStrength: "Strong Match", tagline: "Skilled worker visa fast-tracks your profession." },
];
const STUDY: Card[] = [
  { id: "study-au", kind: "study", flag: "🇦🇺", country: "Australia", title: "Australia", matchStrength: "Good Match", tagline: "Post-study work rights of up to four years." },
  { id: "study-ie", kind: "study", flag: "🇮🇪", country: "Ireland", title: "Ireland", matchStrength: "Good Match", tagline: "English-taught programmes with a two-year stay-back." },
];
const SCHOLARSHIPS: Card[] = [
  { id: "sch-intl", kind: "scholarship", title: "International Scholarships", tagline: "Global funding open to your nationality this cycle." },
  { id: "sch-research", kind: "scholarship", title: "Research Funding", tagline: "Grants matched to your field and qualification level." },
  { id: "sch-health", kind: "scholarship", title: "Healthcare Scholarships", tagline: "Sector-specific funding for medical and nursing pathways." },
];

function Results() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("forme.pending_profile");
      if (raw) setPending(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const highlightedCountries = useMemo(() => {
    const set = new Set<string>();
    ["Canada", "Germany", "Australia", "Ireland"].forEach((c) => set.add(c));
    pending?.countries_of_interest?.forEach((c) => set.add(c));
    return set;
  }, [pending]);

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      {/* Top wordmark */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <span className="text-xs uppercase tracking-[0.35em]" style={{ color: C.muted }}>ForMe</span>
        <Link to="/onboarding" className="text-xs uppercase tracking-[0.25em]" style={{ color: C.muted }}>
          Edit profile
        </Link>
      </div>

      {/* HEADER */}
      <section className="mx-auto max-w-3xl px-6 pt-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: C.text }}
        >
          We searched the world for you.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg"
          style={{ color: C.muted }}
        >
          Here are the international opportunities that best match your profile today.
        </motion.p>
      </section>

      {/* GLOBE */}
      <section className="mx-auto mt-8 flex max-w-4xl items-center justify-center px-6">
        <LightGlobe highlighted={highlightedCountries} />
      </section>

      {/* SECTIONS */}
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        <Section
          icon={<Briefcase className="h-4 w-4" />}
          title="Work"
          subtitle="Countries where your profile may fit employment opportunities."
          cards={WORK}
          onOpen={(id) => navigate({ to: "/journey/$id", params: { id } })}
        />
        <Section
          icon={<GraduationCap className="h-4 w-4" />}
          title="Study"
          subtitle="Countries where your profile may fit study opportunities."
          cards={STUDY}
          onOpen={(id) => navigate({ to: "/journey/$id", params: { id } })}
        />
        <Section
          icon={<Award className="h-4 w-4" />}
          title="Scholarships"
          subtitle="Funding opportunities worth exploring."
          cards={SCHOLARSHIPS}
          onOpen={(id) => navigate({ to: "/journey/$id", params: { id } })}
        />

        {/* BOTTOM CTA */}
        <div
          className="mt-16 overflow-hidden rounded-3xl px-8 py-12 text-center"
          style={{ background: C.bg2 }}
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: C.text }}>
            Want to save these opportunities?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed sm:text-base" style={{ color: C.muted }}>
            Create your free account to save your personalised opportunities, receive future updates and continue your journey.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => navigate({ to: "/auth" })}
              size="lg"
              className="h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
              style={{ background: C.primary, boxShadow: `0 12px 30px -12px ${C.primary}` }}
            >
              Save My Journey <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                const el = document.getElementById("work-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-12 rounded-full px-7 text-base font-medium hover:bg-transparent"
              style={{ color: C.primary }}
            >
              Continue Exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  cards,
  onOpen,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  cards: Card[];
  onOpen: (id: string) => void;
}) {
  return (
    <section id={`${title.toLowerCase()}-section`} className="mt-14 scroll-mt-24">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: C.bg2, color: C.primary }}
        >
          {icon}
        </span>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl" style={{ color: C.text }}>
          {title}
        </h2>
      </div>
      <p className="mt-2 text-sm sm:text-[15px]" style={{ color: C.muted }}>
        {subtitle}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <OpportunityCard key={c.id} card={c} index={i} onOpen={() => onOpen(c.id)} />
        ))}
      </div>
    </section>
  );
}

function OpportunityCard({
  card,
  index,
  onOpen,
}: {
  card: Card;
  index: number;
  onOpen: () => void;
}) {
  const typeLabel =
    card.kind === "work" ? "Work" : card.kind === "study" ? "Study" : "Scholarship";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 * index, ease: [0.2, 0.8, 0.2, 1] }}
      className="group flex h-full flex-col rounded-2xl p-6 transition-all"
      style={{
        background: C.bg,
        border: `1px solid #EEEAF6`,
        boxShadow: "0 1px 2px rgba(30,30,46,0.04), 0 8px 24px -12px rgba(139,92,246,0.10)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {card.flag ? (
            <span className="text-2xl leading-none" aria-hidden>{card.flag}</span>
          ) : (
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: C.bg2, color: C.primary }}
            >
              <Award className="h-4 w-4" />
            </span>
          )}
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>
              {typeLabel}
            </div>
            <div className="text-base font-semibold" style={{ color: C.text }}>
              {card.title}
            </div>
          </div>
        </div>
        {card.matchStrength && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]"
            style={{
              background: card.matchStrength === "Strong Match" ? "#ECFDF5" : C.bg2,
              color: card.matchStrength === "Strong Match" ? C.success : C.primary,
            }}
          >
            {card.matchStrength}
          </span>
        )}
      </div>

      <p className="mt-5 text-sm leading-relaxed" style={{ color: C.muted }}>
        {card.tagline}
      </p>

      <div className="mt-6 flex items-center justify-between border-t pt-4" style={{ borderColor: "#F0ECF9" }}>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>
            Next Action
          </div>
          <div className="text-sm font-medium" style={{ color: C.text }}>View Journey</div>
        </div>
        <button
          onClick={onOpen}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          style={{ background: C.primary, boxShadow: `0 8px 20px -10px ${C.primary}` }}
        >
          View <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* --- Light Globe (self-contained, no dark theme) --- */

type Dot = { name: string; cx: number; cy: number };
const GLOBE_DOTS: Dot[] = [
  { name: "Canada", cx: 140, cy: 155 },
  { name: "United States", cx: 155, cy: 195 },
  { name: "Mexico", cx: 140, cy: 220 },
  { name: "Brazil", cx: 195, cy: 285 },
  { name: "United Kingdom", cx: 232, cy: 150 },
  { name: "Ireland", cx: 228, cy: 152 },
  { name: "Germany", cx: 254, cy: 158 },
  { name: "France", cx: 240, cy: 165 },
  { name: "Sweden", cx: 262, cy: 128 },
  { name: "Netherlands", cx: 244, cy: 150 },
  { name: "Spain", cx: 232, cy: 178 },
  { name: "Italy", cx: 258, cy: 178 },
  { name: "Nigeria", cx: 246, cy: 248 },
  { name: "Kenya", cx: 286, cy: 262 },
  { name: "South Africa", cx: 274, cy: 305 },
  { name: "United Arab Emirates", cx: 302, cy: 208 },
  { name: "India", cx: 332, cy: 218 },
  { name: "Singapore", cx: 358, cy: 252 },
  { name: "Japan", cx: 396, cy: 182 },
  { name: "South Korea", cx: 384, cy: 178 },
  { name: "Australia", cx: 400, cy: 312 },
  { name: "New Zealand", cx: 432, cy: 320 },
];

function LightGlobe({ highlighted }: { highlighted: Set<string> }) {
  return (
    <div className="relative aspect-square w-full max-w-[520px]">
      {/* soft halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${C.bg2} 0%, transparent 65%)`,
        }}
      />
      <motion.svg
        viewBox="0 0 480 480"
        className="relative h-full w-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <radialGradient id="sphere" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor={C.bg2} />
            <stop offset="100%" stopColor="#EFE7FF" />
          </radialGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.primary} stopOpacity="0.5" />
            <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* sphere */}
        <circle cx="240" cy="240" r="200" fill="url(#sphere)" stroke="#EEEAF6" strokeWidth="1" />
        {/* meridians */}
        {[0, 30, 60, 90, 120, 150].map((r) => (
          <ellipse
            key={`m-${r}`}
            cx="240"
            cy="240"
            rx={200 * Math.abs(Math.cos((r * Math.PI) / 180))}
            ry="200"
            fill="none"
            stroke="#E8E1F7"
            strokeWidth="0.6"
          />
        ))}
        {/* parallels */}
        {[40, 100, 160, 240, 320, 380, 440].map((y) => (
          <ellipse key={`p-${y}`} cx="240" cy={y} rx="200" ry="14" fill="none" stroke="#E8E1F7" strokeWidth="0.6" />
        ))}
        {/* dots */}
        {GLOBE_DOTS.map((d) => {
          const on = highlighted.has(d.name);
          return (
            <g key={d.name}>
              {on && (
                <motion.circle
                  cx={d.cx}
                  cy={d.cy}
                  r="10"
                  fill="url(#glow)"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <circle
                cx={d.cx}
                cy={d.cy}
                r={on ? 3.2 : 1.8}
                fill={on ? C.primary : C.accent}
                opacity={on ? 1 : 0.6}
              />
            </g>
          );
        })}
      </motion.svg>
    </div>
  );
}
