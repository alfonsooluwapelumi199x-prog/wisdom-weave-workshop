import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  tokens as T,
  CountryHeader,
  NextActionCard,
  JourneyTimeline,
  MilestoneTracker,
  WhyFitsCard,
  ImproveRecommendationCard,
  type TimelineStep,
} from "@/components/forme";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/journey/$id")({
  head: () => ({ meta: [{ title: "Your Journey · ForMe" }] }),
  component: JourneyPage,
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

const COUNTRY_META: Record<string, { flag: string }> = {
  Canada: { flag: "🇨🇦" },
  Australia: { flag: "🇦🇺" },
  Germany: { flag: "🇩🇪" },
  "United Kingdom": { flag: "🇬🇧" },
  Ireland: { flag: "🇮🇪" },
  "United States": { flag: "🇺🇸" },
  "New Zealand": { flag: "🇳🇿" },
};

const KIND_LABEL = {
  pr: "Permanent Residence",
  work: "Work",
  study: "Study",
  scholarship: "Scholarship",
} as const;

type Kind = keyof typeof KIND_LABEL;

function parseId(id: string): { kind: Kind; country?: string } {
  const [prefix, ...rest] = id.split("-");
  const kind = (prefix === "pr" || prefix === "work" || prefix === "study" || prefix === "scholarship" || prefix === "sch")
    ? (prefix === "sch" ? "scholarship" : (prefix as Kind))
    : "work";
  const slug = rest.join("-");
  const country = Object.keys(COUNTRY_META).find(
    (c) => c.toLowerCase().replace(/\s+/g, "-") === slug,
  );
  return { kind, country };
}

function buildTimeline(kind: Kind): TimelineStep[] {
  switch (kind) {
    case "pr":
      return [
        { n: 1, title: "Confirm your profile details", description: "Make sure your education and profession are up to date.", status: "in_progress" },
        { n: 2, title: "Explore eligibility pathways", description: "Review the streams offered by this destination.", status: "not_started" },
        { n: 3, title: "Prepare supporting documents", status: "not_started" },
        { n: 4, title: "Submit expression of interest", status: "locked" },
      ];
    case "work":
      return [
        { n: 1, title: "Confirm your profile details", description: "Make sure your profession is up to date.", status: "in_progress" },
        { n: 2, title: "Explore employer routes", status: "not_started" },
        { n: 3, title: "Prepare CV for this market", status: "not_started" },
        { n: 4, title: "Apply to opportunities", status: "locked" },
      ];
    case "study":
      return [
        { n: 1, title: "Confirm your qualification", status: "in_progress" },
        { n: 2, title: "Shortlist programmes", status: "not_started" },
        { n: 3, title: "Prepare application materials", status: "not_started" },
        { n: 4, title: "Submit applications", status: "locked" },
      ];
    case "scholarship":
      return [
        { n: 1, title: "Confirm eligibility basics", status: "in_progress" },
        { n: 2, title: "Shortlist scholarships", status: "not_started" },
        { n: 3, title: "Prepare application materials", status: "not_started" },
        { n: 4, title: "Submit applications", status: "locked" },
      ];
  }
}

function JourneyPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { kind, country } = parseId(id);
  const flag = country ? COUNTRY_META[country]?.flag : undefined;
  const opportunityName = country ? `${KIND_LABEL[kind]} in ${country}` : KIND_LABEL[kind];

  const [pending, setPending] = useState<Pending | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("forme.pending_profile");
      if (raw) setPending(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const whyPoints: string[] = [];
  if (pending?.main_goal) whyPoints.push(`Your selected goal is ${pending.main_goal}.`);
  if (pending?.qualification) whyPoints.push(`Your education (${pending.qualification}) aligns with this opportunity.`);
  const prof = pending?.profession ?? pending?.occupation;
  if (prof) whyPoints.push(`Your profession (${prof}) may align with this pathway.`);
  if (country && (pending?.countries_of_interest ?? []).includes(country))
    whyPoints.push(`${country} is one of your preferred destinations.`);

  const milestones = [
    { label: "Education", done: !!pending?.qualification },
    { label: "Occupation", done: !!prof },
    { label: "Preferred Country", done: country ? (pending?.countries_of_interest ?? []).includes(country) : false },
  ];

  const steps = buildTimeline(kind);

  return (
    <div className="min-h-screen" style={{ background: T.card, color: T.text }}>
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <Link
          to="/results"
          className="inline-flex items-center gap-1.5 text-sm"
          style={{ color: T.muted }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to opportunities
        </Link>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-6 pb-24 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <CountryHeader
            flag={flag}
            countryName={country}
            opportunityName={opportunityName}
            eyebrow={KIND_LABEL[kind]}
          />
        </motion.div>

        <NextActionCard
          title="Confirm your profile details"
          description="Review your profile so we can match you to the most relevant next step in this pathway."
          ctaLabel="Start This Step"
          onCta={() => navigate({ to: "/onboarding" })}
        />

        <WhyFitsCard points={whyPoints} />

        <div
          className="rounded-2xl p-6"
          style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 1px 2px rgba(30,30,46,0.04)" }}
        >
          <MilestoneTracker milestones={milestones} title="Milestones" />
        </div>

        <div>
          <div className="mb-4 text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
            Your journey
          </div>
          <JourneyTimeline steps={steps} />
        </div>

        <ImproveRecommendationCard onImprove={() => navigate({ to: "/onboarding" })} />

        <div
          className="rounded-3xl px-7 py-8 text-center"
          style={{ background: T.surface }}
        >
          <p className="text-base font-medium" style={{ color: T.text }}>
            Save this journey to keep your progress and receive updates.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => navigate({ to: "/auth" })}
              size="lg"
              className="h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
              style={{ background: T.primary, boxShadow: `0 12px 30px -12px ${T.primary}` }}
            >
              Save My Journey <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate({ to: "/results" })}
              className="h-12 rounded-full px-7 text-base font-medium hover:bg-transparent"
              style={{ color: T.primary }}
            >
              Continue Exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}