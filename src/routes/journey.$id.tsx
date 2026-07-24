import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  tokens as T,
  CountryHeader,
  NextActionCard,
  JourneyTimeline,
  WhyFitsCard,
  ImproveRecommendationCard,
  ConfidenceCard,
  OfficialResourceCard,
  MistakesList,
  type TimelineStep,
} from "@/components/forme";
import { useEffect, useState } from "react";
import {
  parseJourneyId,
  resolveBlueprint,
  currentStep,
  COUNTRY_FLAG,
  type Pending,
} from "@/lib/opportunity-plans";

export const Route = createFileRoute("/journey/$id")({
  head: () => ({ meta: [{ title: "Your Journey · ForMe" }] }),
  component: JourneyPage,
});

function JourneyPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { kind, country } = parseJourneyId(id);
  const blueprint = resolveBlueprint(kind, country);
  const flag = country ? COUNTRY_FLAG[country] : undefined;

  const [pending, setPending] = useState<Pending | null>(null);
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("forme.pending_profile");
      if (raw) setPending(JSON.parse(raw));
    } catch { /* ignore */ }
    try {
      const rawA = localStorage.getItem(`forme.journey_answers.${id}`);
      if (rawA) setAnswers(JSON.parse(rawA));
      else setAnswers(null);
    } catch { /* ignore */ }
  }, [id]);

  // Note: do NOT auto-redirect to personalise. The correct flow is
  // Details → Opportunity Plan → (user taps CTA) → Complete Journey Profile.

  const ctx = {
    profile: pending ?? {},
    answers: answers ?? {},
    country,
    kind,
  };

  const whyPoints = blueprint.buildReasons(ctx);
  const confidence = blueprint.deriveConfidence(ctx);
  const statuses = blueprint.deriveStatuses(ctx);
  const active = currentStep(blueprint, statuses);

  const steps: TimelineStep[] = blueprint.steps.map((s, i) => ({
    n: i + 1,
    title: s.title,
    description: s.description,
    status: statuses[s.id] ?? "not_started",
  }));

  const openJourneyProfile = () => {
    navigate({ to: "/journey/$id/personalise", params: { id } });
  };

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
            opportunityName={blueprint.displayName}
            eyebrow="Your Opportunity Plan"
          />
        </motion.div>

        <ConfidenceCard level={confidence.level} note={confidence.note} />

        <WhyFitsCard points={whyPoints} />

        <div>
          <div className="mb-4 text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
            Your Opportunity Plan
          </div>
          <JourneyTimeline steps={steps} />
        </div>

        <NextActionCard
          eyebrow="Your Next Action"
          title={active.title}
          description={active.description}
          ctaLabel="Check My Eligibility"
          onCta={openJourneyProfile}
        />

        {(active.estimatedTime || active.estimatedCost) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {active.estimatedTime && (
              <MetaCard label="Estimated Time" value={active.estimatedTime} />
            )}
            {active.estimatedCost && (
              <MetaCard label="Estimated Cost" value={active.estimatedCost} />
            )}
          </div>
        )}

        {active.resources && active.resources.length > 0 && (
          <div data-resources-section>
            <div className="mb-4 text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
              Official Resources
            </div>
            <div className="space-y-3">
              {active.resources.map((r) => (
                <OfficialResourceCard key={r.name} name={r.name} description={r.description} url={r.url} />
              ))}
            </div>
          </div>
        )}

        {active.mistakes && active.mistakes.length > 0 && (
          <MistakesList mistakes={active.mistakes} />
        )}

        {active.whatsNext && (
          <div
            className="rounded-2xl p-6"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
              What's Next
            </div>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: T.text }}>
              {active.whatsNext}
            </p>
          </div>
        )}

        <ImproveRecommendationCard
          ctaLabel="Check My Eligibility"
          onImprove={openJourneyProfile}
        />

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
              onMouseDown={() => {
                try {
                  localStorage.setItem(
                    "forme.last_journey",
                    JSON.stringify({ id, kind, country, displayName: blueprint.displayName, flag, currentTitle: active.title }),
                  );
                } catch { /* ignore */ }
              }}
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

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 1px 2px rgba(30,30,46,0.04)" }}
    >
      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold" style={{ color: T.text }}>
        {value}
      </div>
    </div>
  );
}