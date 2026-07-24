import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, GraduationCap, Award, Home } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  tokens as T,
  CountryHeader,
  CompatibilityCard,
  WhyFitsCard,
  OpportunityCard,
  ImproveRecommendationCard,
  EmptyState,
} from "@/components/forme";
import { getProgram } from "@/lib/opportunity-plans";

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

// Palette pulled from the ForMe token module
const C = {
  bg: "#FFFFFF",
  bg2: T.surface,
  accent: T.secondary,
  primary: T.primary,
  success: T.success,
  text: T.text,
  muted: T.muted,
};

type Card = {
  id: string;
  kind: "work" | "study" | "scholarship" | "pr";
  flag?: string;
  country?: string;
  title: string;
  programName: string;
  tagline: string;
  reasons: string[];
};

const COUNTRY_META: Record<string, { flag: string }> = {
  Canada: { flag: "🇨🇦" },
  Australia: { flag: "🇦🇺" },
  Germany: { flag: "🇩🇪" },
  "United Kingdom": { flag: "🇬🇧" },
  Ireland: { flag: "🇮🇪" },
  "United States": { flag: "🇺🇸" },
  "New Zealand": { flag: "🇳🇿" },
};

const GOAL_LABEL: Record<string, string> = {
  "Permanent Residence": "Permanent Residence Pathways",
  "Work Abroad": "Work Opportunities",
  "Study Abroad": "Study Pathways",
  Scholarships: "Scholarship Opportunities",
};

const KIND_LABEL: Record<Card["kind"], string> = {
  pr: "Permanent Residence",
  work: "Work",
  study: "Study",
  scholarship: "Scholarship",
};

function buildReasons(p: Pending, country: string, programName: string): string[] {
  const reasons: string[] = [];
  reasons.push(`${programName} may be relevant to your stated goal${p.main_goal ? ` of ${p.main_goal.toLowerCase()}` : ""}.`);
  if (p.qualification) reasons.push(`Your education (${p.qualification}) aligns with ${programName}.`);
  if (p.profession ?? p.occupation)
    reasons.push(`Your profession (${p.profession ?? p.occupation}) may align with ${programName}.`);
  if ((p.countries_of_interest ?? []).includes(country))
    reasons.push(`${country} is one of your preferred destinations.`);
  return reasons;
}

function buildRecommendations(p: Pending): { work: Card[]; study: Card[]; scholarship: Card[]; pr: Card[] } {
  const goal = p.main_goal ?? "";
  const interests = p.countries_of_interest ?? [];
  const worldwide = interests.length === 0 || interests.includes("Other");
  const targetCountries = worldwide
    ? ["Canada", "Australia", "Germany", "United Kingdom", "Ireland", "United States", "New Zealand"]
    : interests.filter((c) => c !== "Other");

  const makeCard = (kind: Card["kind"]) => (country: string): Card => {
    const program = getProgram(kind, country);
    return {
      id: `${kind}-${country.toLowerCase().replace(/\s+/g, "-")}`,
      kind,
      flag: COUNTRY_META[country]?.flag,
      country,
      title: program.name,
      programName: program.name,
      tagline: program.description,
      reasons: buildReasons(p, country, program.name),
    };
  };

  const work = targetCountries.map(makeCard("work"));
  const study = targetCountries.map(makeCard("study"));
  const pr = targetCountries.map(makeCard("pr"));
  const scholarship = targetCountries.slice(0, 3).map(makeCard("scholarship"));
  // Suppress unused var warning — `goal` is used by the caller
  void goal;

  return { work, study, scholarship, pr };
}

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
    const interests = (pending?.countries_of_interest ?? []).filter((c) => c !== "Other");
    if (interests.length === 0) {
      ["Canada", "Germany", "Australia", "Ireland", "United Kingdom", "United States", "New Zealand"].forEach((c) => set.add(c));
    } else {
      interests.forEach((c) => set.add(c));
    }
    return set;
  }, [pending]);

  const recs = useMemo(() => buildRecommendations(pending ?? {}), [pending]);
  const goal = pending?.main_goal ?? "";

  const selectedInterests = (pending?.countries_of_interest ?? []).filter((c) => c !== "Other");
  const singleCountry = selectedInterests.length === 1 ? selectedInterests[0] : undefined;
  const singleGoal = goal || undefined;
  const showFocusedHeader = !!(singleCountry && singleGoal);

  const topReasons = useMemo(() => {
    const items: { ok: boolean; text: string }[] = [];
    if (pending?.main_goal) items.push({ ok: true, text: `Your selected goal is ${pending.main_goal}.` });
    if (pending?.qualification) items.push({ ok: true, text: `Your education (${pending.qualification}) aligns with this opportunity.` });
    const prof = pending?.profession ?? pending?.occupation;
    if (prof) items.push({ ok: true, text: `Your profession (${prof}) may align with this pathway.` });
    if (singleCountry) items.push({ ok: true, text: `${singleCountry} is one of your preferred destinations.` });
    if (pending?.nationality) items.push({ ok: true, text: `Open to citizens of ${pending.nationality}.` });
    return items;
  }, [pending, singleCountry]);

  // Goal-driven ordering
  const sections = useMemo(() => {
    const S = {
      pr: { icon: <Home className="h-4 w-4" />, title: "Permanent Residence", subtitle: "Long-term settlement pathways matched to your profile.", cards: recs.pr },
      work: { icon: <Briefcase className="h-4 w-4" />, title: "Work", subtitle: "Employer-sponsored routes where your profile may fit.", cards: recs.work },
      study: { icon: <GraduationCap className="h-4 w-4" />, title: "Study", subtitle: "Study pathways aligned with your qualification.", cards: recs.study },
      scholarship: { icon: <Award className="h-4 w-4" />, title: "Scholarships", subtitle: "Funding opportunities worth exploring.", cards: recs.scholarship },
    };
    switch (goal) {
      case "Permanent Residence": return [S.pr];
      case "Work Abroad": return [S.work];
      case "Study Abroad": return [S.study];
      case "Scholarships": return [S.scholarship];
      default: return [S.pr, S.work, S.study, S.scholarship];
    }
  }, [goal, recs]);

  const hasAny = sections.some((s) => s.cards.length > 0);

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
        {showFocusedHeader ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <CountryHeader
              flag={COUNTRY_META[singleCountry!]?.flag}
              countryName={singleCountry}
              opportunityName={GOAL_LABEL[singleGoal!] ?? singleGoal!}
              eyebrow="We searched the world for you"
            />
          </motion.div>
        ) : (
          <>
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
          </>
        )}
      </section>

      {/* GLOBE */}
      <section className="mx-auto mt-8 flex max-w-4xl items-center justify-center px-6">
        <LightGlobe highlighted={highlightedCountries} />
      </section>

      {/* TOP SUMMARY: Compatibility + Why */}
      <section className="mx-auto mt-10 grid max-w-4xl gap-4 px-6 sm:grid-cols-2">
        <CompatibilityCard mode="preliminary" label="Current Profile Fit" reasons={topReasons} />
        <WhyFitsCard points={topReasons.map((r) => r.text)} />
      </section>

      {/* SECTIONS */}
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        {hasAny ? sections.map((s) => (
          <Section
            key={s.title}
            icon={s.icon}
            title={s.title}
            subtitle={s.subtitle}
            cards={s.cards}
            onOpen={(id) => {
              // Preserve the selected opportunity and the full recommendation set.
              try {
                const all = [...recs.pr, ...recs.work, ...recs.study, ...recs.scholarship];
                const chosen = all.find((c) => c.id === id);
                if (chosen) {
                  localStorage.setItem(
                    "forme.last_journey",
                    JSON.stringify({
                      id: chosen.id,
                      kind: chosen.kind,
                      country: chosen.country,
                      displayName: chosen.programName,
                      flag: chosen.flag,
                    }),
                  );
                }
                localStorage.setItem(
                  "forme.recommendations",
                  JSON.stringify(all.map((c) => ({ id: c.id, kind: c.kind, country: c.country, displayName: c.programName, flag: c.flag }))),
                );
              } catch { /* ignore */ }
              navigate({ to: "/journey/$id/details", params: { id } });
            }}
          />
        )) : (
          <div className="mt-10">
            <EmptyState
              title="No opportunities found yet."
              description="Try changing your preferences or exploring more countries."
              action={{ label: "Edit profile", onClick: () => navigate({ to: "/onboarding" }) }}
            />
          </div>
        )}

        {/* Improve Recommendation → account + journey profile, never restart onboarding */}
        <div className="mt-14">
          <ImproveRecommendationCard onImprove={() => navigate({ to: "/auth" })} />
        </div>

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
                const el = document.querySelector<HTMLElement>("[data-results-section]");
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
    <section data-results-section id={`${title.toLowerCase().replace(/\s+/g, "-")}-section`} className="mt-14 scroll-mt-24">
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
          <OpportunityCard
            key={c.id}
            index={i}
            flag={c.flag}
            country={c.country}
            opportunityType={KIND_LABEL[c.kind]}
            title={c.title}
            tagline={c.tagline}
            fit={{ label: "Current Fit", reasons: c.reasons }}
            nextAction="View Journey"
            onView={() => onOpen(c.id)}
          />
        ))}
      </div>
    </section>
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
