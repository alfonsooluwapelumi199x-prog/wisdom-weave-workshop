import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/journey/$id")({
  head: () => ({ meta: [{ title: "Your Journey · ForMe" }] }),
  component: JourneyPage,
});

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

type Milestone = { label: string; done: boolean };

type Journey = {
  flag?: string;
  eyebrow: string;
  title: string;
  why: string;
  next: string;
  milestones: Milestone[];
};

const JOURNEYS: Record<string, Journey> = {
  "work-ca": {
    flag: "🇨🇦",
    eyebrow: "Work · Canada",
    title: "A healthcare pathway to Canada",
    why: "Your profession, qualification and language profile align with Canada's active recruitment for healthcare roles.",
    next: "Register for a language test and prepare your credentials for assessment.",
    milestones: [
      { label: "Education", done: true },
      { label: "Occupation", done: true },
      { label: "English Test", done: false },
      { label: "Credential Assessment", done: false },
      { label: "Application", done: false },
    ],
  },
  "work-de": {
    flag: "🇩🇪",
    eyebrow: "Work · Germany",
    title: "A skilled worker route to Germany",
    why: "Germany's Skilled Worker Visa fits your profession and qualification, with strong demand in your field.",
    next: "Begin a basic German language course while you prepare your qualification recognition.",
    milestones: [
      { label: "Education", done: true },
      { label: "Occupation", done: true },
      { label: "Language (A2/B1)", done: false },
      { label: "Qualification Recognition", done: false },
      { label: "Application", done: false },
    ],
  },
  "study-au": {
    flag: "🇦🇺",
    eyebrow: "Study · Australia",
    title: "A study pathway to Australia",
    why: "Your qualification and goals match Australian programmes with post-study work rights.",
    next: "Shortlist three programmes and check intake dates.",
    milestones: [
      { label: "Education", done: true },
      { label: "Programme Shortlist", done: false },
      { label: "English Test", done: false },
      { label: "Statement of Purpose", done: false },
      { label: "Application", done: false },
    ],
  },
  "study-ie": {
    flag: "🇮🇪",
    eyebrow: "Study · Ireland",
    title: "A study pathway to Ireland",
    why: "Ireland offers English-taught programmes with a two-year post-study stay-back suited to your goals.",
    next: "Shortlist programmes and confirm English test requirements.",
    milestones: [
      { label: "Education", done: true },
      { label: "Programme Shortlist", done: false },
      { label: "English Test", done: false },
      { label: "Application", done: false },
      { label: "Visa", done: false },
    ],
  },
  "sch-intl": {
    eyebrow: "Scholarships",
    title: "International Scholarships",
    why: "Several global scholarships are open to your nationality and field this cycle.",
    next: "Prepare a base CV and personal statement you can adapt to each scholarship.",
    milestones: [
      { label: "CV", done: false },
      { label: "Personal Statement", done: false },
      { label: "References", done: false },
      { label: "Application", done: false },
    ],
  },
  "sch-research": {
    eyebrow: "Scholarships · Research",
    title: "Research Funding",
    why: "Your qualification level aligns with grants supporting early-career researchers in your field.",
    next: "Identify two supervisors whose work matches your interests.",
    milestones: [
      { label: "Research Interest", done: true },
      { label: "Supervisor Match", done: false },
      { label: "Proposal Draft", done: false },
      { label: "Application", done: false },
    ],
  },
  "sch-health": {
    eyebrow: "Scholarships · Healthcare",
    title: "Healthcare Scholarships",
    why: "Sector-specific funding exists for medical and nursing candidates matching your background.",
    next: "Gather transcripts and a professional reference from a clinical setting.",
    milestones: [
      { label: "Transcripts", done: false },
      { label: "Clinical Reference", done: false },
      { label: "Personal Statement", done: false },
      { label: "Application", done: false },
    ],
  },
};

function JourneyPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const j = JOURNEYS[id] ?? JOURNEYS["work-ca"];

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <Link
          to="/results"
          className="inline-flex items-center gap-1.5 text-sm"
          style={{ color: C.muted }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to opportunities
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="flex items-center gap-3">
            {j.flag && <span className="text-3xl leading-none" aria-hidden>{j.flag}</span>}
            <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: C.muted }}>
              {j.eyebrow}
            </span>
          </div>
          <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {j.title}
          </h1>
        </motion.div>

        {/* Three questions */}
        <div className="mt-10 grid gap-4">
          <Block label="Why was this recommended for me?" body={j.why} />
          <Block label="What do I need to do next?" body={j.next} />
          <MilestoneBlock milestones={j.milestones} />
        </div>

        {/* CTA */}
        <div
          className="mt-12 rounded-3xl px-7 py-8 text-center"
          style={{ background: C.bg2 }}
        >
          <p className="text-base font-medium" style={{ color: C.text }}>
            Save this journey to keep your progress and receive updates.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
              onClick={() => navigate({ to: "/results" })}
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

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: C.bg,
        border: `1px solid #EEEAF6`,
        boxShadow: "0 1px 2px rgba(30,30,46,0.04), 0 8px 24px -12px rgba(139,92,246,0.08)",
      }}
    >
      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>
        {label}
      </div>
      <p className="mt-3 text-base leading-relaxed" style={{ color: C.text }}>
        {body}
      </p>
    </div>
  );
}

function MilestoneBlock({ milestones }: { milestones: Milestone[] }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: C.bg,
        border: `1px solid #EEEAF6`,
        boxShadow: "0 1px 2px rgba(30,30,46,0.04), 0 8px 24px -12px rgba(139,92,246,0.08)",
      }}
    >
      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>
        How close am I?
      </div>
      <ul className="mt-4 space-y-3">
        {milestones.map((m) => (
          <li key={m.label} className="flex items-center gap-3">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full"
              style={{
                background: m.done ? C.success : "transparent",
                border: m.done ? "none" : `1.5px solid ${C.accent}`,
                color: "#fff",
              }}
            >
              {m.done && <Check className="h-3.5 w-3.5" />}
            </span>
            <span
              className="text-[15px]"
              style={{ color: m.done ? C.text : C.muted, fontWeight: m.done ? 500 : 400 }}
            >
              {m.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}