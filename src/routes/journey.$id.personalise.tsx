import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { tokens as T } from "@/components/forme";
import { parseJourneyId, resolveBlueprint } from "@/lib/opportunity-plans";

export const Route = createFileRoute("/journey/$id/personalise")({
  head: () => ({ meta: [{ title: "Personalise your plan · ForMe" }] }),
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setAnswers(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [storageKey]);

  // If there are no questions for this opportunity, skip straight to the plan.
  useEffect(() => {
    if (blueprint.questions.length === 0) {
      try { localStorage.setItem(storageKey, JSON.stringify({})); } catch { /* ignore */ }
      navigate({ to: "/journey/$id", params: { id }, replace: true });
    }
  }, [blueprint, id, navigate, storageKey]);

  if (blueprint.questions.length === 0) return null;

  const q = blueprint.questions[i];
  const total = blueprint.questions.length;
  const selected = answers[q.id];

  const persist = (next: Record<string, string>) => {
    setAnswers(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const onSelect = (value: string) => persist({ ...answers, [q.id]: value });

  const onNext = () => {
    if (i < total - 1) setI(i + 1);
    else navigate({ to: "/journey/$id", params: { id } });
  };

  const onBack = () => {
    if (i > 0) setI(i - 1);
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
            Let's make this plan yours.
          </h1>
          <p className="mt-3 text-base" style={{ color: T.muted }}>
            This will take less than one minute.
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mt-10 flex items-center justify-center gap-1.5">
          {blueprint.questions.map((_, idx) => (
            <span
              key={idx}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === i ? 28 : 10,
                background: idx <= i ? T.primary : T.border,
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
                Question {i + 1} of {total}
              </div>
              <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight" style={{ color: T.text }}>
                {q.prompt}
              </h2>
              {q.helper && (
                <p className="mt-2 text-sm" style={{ color: T.muted }}>
                  {q.helper}
                </p>
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
            {i < total - 1 ? "Next" : "See My Plan"} <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}