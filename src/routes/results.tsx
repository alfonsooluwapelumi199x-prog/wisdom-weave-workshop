import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, GraduationCap, Award, Home, Check, AlertTriangle } from "lucide-react";
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
  kind: "work" | "study" | "scholarship" | "pr";
  flag?: string;
  country?: string;
  title: string;
  tagline: string;
  score: number;
  reasons: { ok: boolean; text: string }[];
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

const ENGLISH_SPEAKING = new Set([
  "United Kingdom","United States","Canada","Australia","New Zealand","Ireland",
  "Nigeria","Ghana","Kenya","South Africa","Jamaica","Uganda","Rwanda","Singapore","India","Pakistan",
]);

function buildRecommendations(p: Pending): { work: Card[]; study: Card[]; scholarship: Card[]; pr: Card[] } {
  const goal = p.main_goal ?? "";
  const interests = p.countries_of_interest ?? [];
  const worldwide = interests.length === 0 || interests.includes("Other");
  const targetCountries = worldwide
    ? ["Canada", "Australia", "Germany", "United Kingdom", "Ireland", "United States", "New Zealand"]
    : interests.filter((c) => c !== "Other");

  const profession = p.profession ?? p.occupation ?? "";
  const qualification = p.qualification ?? "";
  const nationality = p.nationality ?? "";
  const isEnglishNative = ENGLISH_SPEAKING.has(nationality);
  const isEnglishCountry = (c: string) => ENGLISH_SPEAKING.has(c);
  const hasDegree = ["Bachelor's Degree", "Master's Degree", "PhD"].includes(qualification);
  const isAdvanced = ["Master's Degree", "PhD"].includes(qualification);

  const score = (base: number, adjustments: number[]) =>
    Math.max(45, Math.min(97, Math.round(adjustments.reduce((a, b) => a + b, base))));

  const professionFit = (country: string): { pts: number; text: string } => {
    const p = profession || "your background";
    return { pts: profession ? 8 : 0, text: `${p} background` };
  };

  const langCheck = (country: string) => {
    const ok = isEnglishNative || isEnglishCountry(country) || ["Germany"].includes(country) === false;
    if (isEnglishCountry(country) && !isEnglishNative) {
      return { ok: false, text: "English language test required (IELTS / PTE)" };
    }
    if (country === "Germany") {
      return { ok: false, text: "German language proficiency (B1+) recommended" };
    }
    return { ok: true, text: "Language requirement met" };
  };

  const credentialCheck = (country: string) => {
    if (!hasDegree) return { ok: false, text: "Credential assessment required" };
    if (["Canada", "Australia", "New Zealand"].includes(country)) {
      return { ok: false, text: "Credential assessment (ECA / VETASSESS) required" };
    }
    if (country === "Germany") return { ok: false, text: "Anabin recognition required" };
    return { ok: true, text: "Qualification recognised" };
  };

  const workCard = (country: string): Card => {
    const fit = professionFit(country);
    const lang = langCheck(country);
    const cred = credentialCheck(country);
    const s = score(70, [hasDegree ? 8 : -5, isAdvanced ? 4 : 0, fit.pts, lang.ok ? 3 : -4, cred.ok ? 4 : -3]);
    return {
      id: `work-${country.toLowerCase().replace(/\s+/g, "-")}`,
      kind: "work",
      flag: COUNTRY_META[country]?.flag,
      country,
      title: `Work in ${country}`,
      tagline: profession
        ? `${country} is actively hiring ${profession.toLowerCase()} professionals${p.country_of_residence ? ` from ${p.country_of_residence}` : ""} through employer-sponsored routes.`
        : `${country} has employer-sponsored routes that may suit your background.`,
      score: s,
      reasons: [
        { ok: !!qualification, text: qualification || "Qualification not provided" },
        { ok: !!profession, text: fit.text },
        cred,
        lang,
      ],
    };
  };

  const studyCard = (country: string): Card => {
    const lang = langCheck(country);
    const s = score(72, [hasDegree ? 6 : 3, isAdvanced ? 5 : 0, lang.ok ? 4 : -3]);
    return {
      id: `study-${country.toLowerCase().replace(/\s+/g, "-")}`,
      kind: "study",
      flag: COUNTRY_META[country]?.flag,
      country,
      title: `Study in ${country}`,
      tagline: `${country} offers ${isAdvanced ? "postgraduate" : "undergraduate and postgraduate"} programmes${profession ? ` in ${profession.toLowerCase()}` : ""} with post-study work rights.`,
      score: s,
      reasons: [
        { ok: !!qualification, text: qualification ? `${qualification} accepted for entry` : "Qualification not provided" },
        { ok: true, text: "Post-study work visa available" },
        lang,
        { ok: false, text: "Proof of funds required" },
      ],
    };
  };

  const prCard = (country: string): Card => {
    const lang = langCheck(country);
    const cred = credentialCheck(country);
    const s = score(68, [hasDegree ? 10 : -6, isAdvanced ? 5 : 0, profession ? 5 : 0, lang.ok ? 3 : -4, cred.ok ? 3 : -3]);
    return {
      id: `pr-${country.toLowerCase().replace(/\s+/g, "-")}`,
      kind: "pr",
      flag: COUNTRY_META[country]?.flag,
      country,
      title: `Permanent Residence in ${country}`,
      tagline: `${country} offers a points-based pathway to permanent residence${profession ? ` for skilled ${profession.toLowerCase()} professionals` : ""}${qualification ? ` with a ${qualification.toLowerCase()}` : ""}.`,
      score: s,
      reasons: [
        { ok: !!qualification, text: qualification || "Qualification not provided" },
        { ok: !!profession, text: profession ? `${profession} on skilled occupation lists` : "Profession not provided" },
        cred,
        lang,
      ],
    };
  };

  const scholarshipCard = (country: string): Card => {
    const s = score(74, [isAdvanced ? 8 : hasDegree ? 4 : -2, profession ? 3 : 0]);
    return {
      id: `sch-${country.toLowerCase().replace(/\s+/g, "-")}`,
      kind: "scholarship",
      flag: COUNTRY_META[country]?.flag,
      country,
      title: `Scholarships in ${country}`,
      tagline: `Government and university-funded scholarships in ${country}${profession ? ` for ${profession.toLowerCase()} candidates` : ""}${isAdvanced ? " at postgraduate level" : ""}.`,
      score: s,
      reasons: [
        { ok: hasDegree, text: hasDegree ? `${qualification} meets typical eligibility` : "Bachelor's minimum usually required" },
        { ok: true, text: `Open to ${nationality || "your nationality"}` },
        { ok: false, text: "Competitive — strong academic record needed" },
        { ok: false, text: "Application deadlines apply" },
      ],
    };
  };

  const work = targetCountries.map(workCard).sort((a, b) => b.score - a.score);
  const study = targetCountries.map(studyCard).sort((a, b) => b.score - a.score);
  const pr = targetCountries.map(prCard).sort((a, b) => b.score - a.score);
  const scholarship = targetCountries.slice(0, 3).map(scholarshipCard).sort((a, b) => b.score - a.score);

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
    const interests = pending?.countries_of_interest ?? [];
    if (interests.length === 0 || interests.includes("Other")) {
      ["Canada", "Germany", "Australia", "Ireland", "United Kingdom", "United States", "New Zealand"].forEach((c) => set.add(c));
    }
    interests.filter((c) => c !== "Other").forEach((c) => set.add(c));
    return set;
  }, [pending]);

  const recs = useMemo(() => buildRecommendations(pending ?? {}), [pending]);
  const goal = pending?.main_goal ?? "";

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
        {sections.map((s) => (
          <Section
            key={s.title}
            icon={s.icon}
            title={s.title}
            subtitle={s.subtitle}
            cards={s.cards}
            onOpen={(id) => navigate({ to: "/journey/$id", params: { id } })}
          />
        ))}

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
    card.kind === "work" ? "Work" :
    card.kind === "study" ? "Study" :
    card.kind === "pr" ? "Permanent Residence" : "Scholarship";
  const scoreColor = card.score >= 80 ? C.success : card.score >= 65 ? C.primary : C.muted;
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
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>Compatibility</div>
          <div className="text-lg font-semibold leading-tight" style={{ color: scoreColor }}>
            {card.score}<span className="text-xs font-medium" style={{ color: C.muted }}>/100</span>
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed" style={{ color: C.muted }}>
        {card.tagline}
      </p>

      <ul className="mt-4 space-y-1.5">
        {card.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: r.ok ? C.text : C.muted }}>
            {r.ok ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.success }} strokeWidth={3} />
            ) : (
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#D97706" }} />
            )}
            <span>{r.text}</span>
          </li>
        ))}
      </ul>

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
