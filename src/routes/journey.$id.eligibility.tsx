import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, HelpCircle, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { tokens as T, CountryHeader } from "@/components/forme";
import {
  parseJourneyId,
  resolveBlueprint,
  COUNTRY_FLAG,
  type Pending,
  type Question,
} from "@/lib/opportunity-plans";

export const Route = createFileRoute("/journey/$id/eligibility")({
  head: () => ({ meta: [{ title: "Eligibility Summary · ForMe" }] }),
  component: EligibilitySummary,
});

type Bucket = {
  key: "confirmed" | "likely" | "unknown" | "todo";
  label: string;
  tone: string;
  icon: React.ReactNode;
  items: string[];
};

const POSITIVE = new Set(["yes", "yes_have", "high", "top", "strong"]);
const PENDING = new Set(["planning", "yes_need", "expiring", "shortlist", "partial", "mid"]);
const NEGATIVE = new Set(["no", "not_yet"]);
const UNKNOWN = new Set(["unsure", "not_required", "prefer_not", "skip"]);

function classify(q: Question, value?: string): Bucket["key"] {
  if (!value) return "unknown";
  if (POSITIVE.has(value)) return "confirmed";
  if (PENDING.has(value)) return "likely";
  if (NEGATIVE.has(value)) return "todo";
  if (UNKNOWN.has(value)) return "unknown";
  return "likely";
}

function EligibilitySummary() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { kind, country } = parseJourneyId(id);
  const blueprint = useMemo(() => resolveBlueprint(kind, country), [kind, country]);
  const flag = country ? COUNTRY_FLAG[country] : undefined;

  const [pending, setPending] = useState<Pending>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("forme.pending_profile");
      if (raw) setPending(JSON.parse(raw));
    } catch { /* ignore */ }
    try {
      const raw = localStorage.getItem(`forme.journey_answers.${id}`);
      if (raw) setAnswers(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [id]);

  const confirmed: string[] = [];
  if (pending.country_of_residence) confirmed.push(`Currently living in ${pending.country_of_residence}`);
  if (pending.nationality) confirmed.push(`Nationality: ${pending.nationality}`);
  if (pending.qualification) confirmed.push(`Highest qualification: ${pending.qualification}`);
  const prof = pending.profession ?? pending.occupation;
  if (prof) confirmed.push(`Profession: ${prof}`);
  if (pending.main_goal) confirmed.push(`Goal: ${pending.main_goal}`);
  if (country) confirmed.push(`Preferred destination includes ${country}`);

  const likely: string[] = [];
  const unknown: string[] = [];
  const todo: string[] = [];

  for (const q of blueprint.questions) {
    const value = answers[q.id];
    const opt = q.options.find((o) => o.value === value);
    const label = opt ? `${q.prompt} — ${opt.label}` : q.prompt;
    const bucket = classify(q, value);
    if (bucket === "confirmed") confirmed.push(label);
    else if (bucket === "likely") likely.push(label);
    else if (bucket === "todo") todo.push(label);
    else unknown.push(label);
  }

  const nextActions: string[] = [];
  if (todo.some((t) => t.toLowerCase().includes("language"))) nextActions.push("Book an approved language test and record your scores.");
  if (todo.some((t) => t.toLowerCase().includes("credential") || t.toLowerCase().includes("qualification"))) nextActions.push("Start a credential assessment for your qualifications.");
  if (todo.some((t) => t.toLowerCase().includes("passport"))) nextActions.push("Renew or apply for a valid passport.");
  if (unknown.length > 0) nextActions.push("Fill in the details you weren't sure about — we'll refine your plan as soon as you do.");
  if (nextActions.length === 0) nextActions.push(`Continue preparing the documents required for ${blueprint.displayName}.`);

  const buckets: Bucket[] = [
    { key: "confirmed", label: "Information confirmed", tone: T.success, icon: <CheckCircle2 className="h-4 w-4" />, items: confirmed },
    { key: "likely", label: "Requirements likely met", tone: T.primary, icon: <CheckCircle2 className="h-4 w-4" />, items: likely },
    { key: "unknown", label: "Requirements still unknown", tone: T.muted, icon: <HelpCircle className="h-4 w-4" />, items: unknown },
    { key: "todo", label: "Requirements not yet completed", tone: "#B45309", icon: <CircleDashed className="h-4 w-4" />, items: todo },
  ];

  return (
    <div className="min-h-screen" style={{ background: T.card, color: T.text }}>
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <Link
          to="/journey/$id"
          params={{ id }}
          className="inline-flex items-center gap-1.5 text-sm"
          style={{ color: T.muted }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Opportunity Plan
        </Link>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-6 pb-24 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <CountryHeader
            flag={flag}
            countryName={country}
            opportunityName={blueprint.displayName}
            eyebrow="Eligibility Summary"
          />
        </motion.div>

        <div
          className="rounded-2xl p-5"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <p className="text-[14px] leading-relaxed" style={{ color: T.text }}>
            Based on the information provided, you appear to meet some of the key
            requirements for {blueprint.displayName}. Additional checks or an
            official assessment may still be required.
          </p>
        </div>

        {buckets.map((b) => (
          b.items.length === 0 ? null : (
            <section key={b.key}>
              <div className="flex items-center gap-2">
                <span style={{ color: b.tone }}>{b.icon}</span>
                <h2 className="text-lg font-semibold tracking-tight" style={{ color: T.text }}>
                  {b.label}
                </h2>
              </div>
              <ul className="mt-3 space-y-2">
                {b.items.map((it, i) => (
                  <li
                    key={i}
                    className="rounded-2xl px-4 py-3 text-[14px] leading-relaxed"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </section>
          )
        ))}

        <section>
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: T.text }}>
            Recommended next actions
          </h2>
          <ul className="mt-3 space-y-2">
            {nextActions.map((n, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl px-4 py-3 text-[14px] leading-relaxed"
                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
              >
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.primary }} />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>

        <div
          className="flex items-start gap-3 rounded-2xl p-5"
          style={{ background: T.surface, border: `1px dashed ${T.secondary}` }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.primary }} />
          <p className="text-[13px] leading-relaxed" style={{ color: T.muted }}>
            ForMe provides guidance based on the information you've shared. Final
            eligibility for {blueprint.displayName} is determined by the relevant
            government authority or institution.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button
            size="lg"
            onClick={() => navigate({ to: "/auth" })}
            className="h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{ background: T.primary, boxShadow: `0 12px 30px -12px ${T.primary}` }}
          >
            Create My World <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate({ to: "/journey/$id", params: { id } })}
            className="h-12 rounded-full px-7 text-base font-medium hover:bg-transparent"
            style={{ color: T.primary }}
          >
            Review My Opportunity Plan
          </Button>
        </div>
      </div>
    </div>
  );
}