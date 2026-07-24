import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { tokens as T } from "@/components/forme";
import { parseJourneyId, resolveBlueprint, type Pending, type Question } from "@/lib/opportunity-plans";

export const Route = createFileRoute("/journey/$id/personalise")({
  head: () => ({ meta: [{ title: "Complete Your Journey Profile · ForMe" }] }),
  component: Personalise,
});

function Personalise() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { kind, country } = parseJourneyId(id);
  const blueprint = useMemo(() => resolveBlueprint(kind, country), [kind, country]);
  const storageKey = `forme.journey_answers.${id}`;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [i, setI] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setAnswers(JSON.parse(raw));
    } catch { /* ignore */ }
    try {
      const rawP = localStorage.getItem("forme.pending_profile");
      if (rawP) setPending(JSON.parse(rawP));
    } catch { /* ignore */ }
  }, [storageKey]);

  // Filter out any question whose data we already know from the initial
  // discovery profile (never re-ask the original six discovery questions,
  // and skip anything derivable from them).
  const questions: Question[] = useMemo(() => {
    const p = pending ?? {};
    const known = new Set<string>();
    if (p.country_of_residence) known.add("country_of_residence");
    if (p.nationality) known.add("nationality");
    if (p.qualification) { known.add("qualification"); known.add("level"); }
    if (p.profession ?? p.occupation) known.add("profession");
    if (p.main_goal) known.add("main_goal");
    if ((p.countries_of_interest ?? []).length > 0) known.add("countries_of_interest");
    return blueprint.questions.filter((q) => !known.has(q.id));
  }, [blueprint, pending]);

  // If there are no questions for this opportunity, skip straight to account creation.
  useEffect(() => {
    if (questions.length === 0) {
      try { localStorage.setItem(storageKey, JSON.stringify({})); } catch { /* ignore */ }
      try {
        localStorage.setItem(
          "forme.last_journey",
          JSON.stringify({ id, kind, country, displayName: blueprint.displayName }),
        );
      } catch { /* ignore */ }
      navigate({ to: "/auth", replace: true });
    }
  }, [questions, blueprint, id, kind, country, navigate, storageKey]);

  if (questions.length === 0) return null;

  const safeI = Math.min(i, questions.length - 1);
  const q = questions[safeI];
  const total = questions.length;
  const selected = answers[q.id];

  const persist = (next: Record<string, string>) => {
    setAnswers(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const onSelect = (value: string) => persist({ ...answers, [q.id]: value });

  const onNext = () => {
    if (safeI < total - 1) setI(safeI + 1);
    else {
      try {
        localStorage.setItem(
          "forme.last_journey",
          JSON.stringify({ id, kind, country, displayName: blueprint.displayName }),
        );
      } catch { /* ignore */ }
      navigate({ to: "/auth" });
    }
  };

  const onBack = () => {
    if (safeI > 0) setI(safeI - 1);
    else navigate({ to: "/results" });
  };

  return (
    <div className="min-h-screen" style={{ background: T.card, color: T.text }}>
      <div className="mx-auto max-w-2xl px-6 pt-8">
        <Link to="/results" className="inline-flex items-center gap-1.5 text-sm" style={{ color: T.muted }}>
          <ArrowLeft className="h-4 w-4" /> Back to opportunities
        </Link>
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-center"
        >
          <span className="text-[11px] uppercase tracking-[0.28em]" style={{ color: T.primary }}>
            {blueprint.displayName}
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: T.text }}>
            Complete Your Journey Profile
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed" style={{ color: T.muted }}>
            We already know enough to recommend this opportunity. Answer a few
            additional questions so we can assess your current position more
            accurately, personalise your roadmap and help you track what comes next.
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mt-10 flex items-center justify-center gap-1.5">
          {questions.map((_, idx) => (
            <span
              key={idx}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === safeI ? 28 : 10,
                background: idx <= safeI ? T.primary : T.border,
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-10"
          >
            <div
              className="rounded-3xl p-8"
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                boxShadow: "0 2px 4px rgba(30,30,46,0.04), 0 20px 40px -24px rgba(139,92,246,0.20)",
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
                Question {safeI + 1} of {total}
              </div>
              <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight" style={{ color: T.text }}>
                {q.prompt}
              </h2>
              {q.helper && (
                <p className="mt-2 text-sm" style={{ color: T.muted }}>
                  {q.helper}
                </p>
              )}
              {q.why && (
                <div
                  className="mt-4 rounded-xl px-4 py-3 text-[13px] leading-relaxed"
                  style={{ background: T.surface, color: T.muted, border: `1px solid ${T.border}` }}
                >
                  <span className="font-medium" style={{ color: T.text }}>Why we ask:</span>{" "}
                  {q.why}
                </div>
              )}

              <div className="mt-6 space-y-2.5">
                {q.options.map((opt) => {
                  const active = selected === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => onSelect(opt.value)}
                      className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-[15px] transition-all hover:-translate-y-0.5"
                      style={{
                        background: active ? T.surface : T.card,
                        border: `1.5px solid ${active ? T.primary : T.border}`,
                        color: T.text,
                      }}
                    >
                      <span className="font-medium">{opt.label}</span>
                      {active && (
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white"
                          style={{ background: T.primary }}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={onBack}
            className="h-12 rounded-full px-6 text-sm font-medium hover:bg-transparent"
            style={{ color: T.muted }}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <Button
            size="lg"
            disabled={!selected}
            onClick={onNext}
            className="h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            style={{ background: T.primary, boxShadow: `0 12px 30px -12px ${T.primary}` }}
          >
            {safeI < total - 1 ? "Next" : "Create My World"} <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}