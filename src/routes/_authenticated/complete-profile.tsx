import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tokens as T } from "@/components/forme";
import { parseJourneyId } from "@/lib/opportunity-plans";

export const Route = createFileRoute("/_authenticated/complete-profile")({
  head: () => ({ meta: [{ title: "Complete your profile · ForMe" }] }),
  component: CompleteProfile,
});

type Question = {
  id: string;
  prompt: string;
  helper?: string;
  options: { value: string; label: string }[];
  optional?: boolean;
};

type LastJourney = {
  id: string;
  kind: string;
  country?: string;
  displayName?: string;
};

const EXTRAS_KEY = "forme.profile_extras";

function buildQuestions(kind?: string, country?: string): Question[] {
  const base: Question[] = [
    {
      id: "years_experience",
      prompt: "How many years of professional work experience do you have?",
      options: [
        { value: "<1", label: "Less than 1 year" },
        { value: "1-2", label: "1–2 years" },
        { value: "3-5", label: "3–5 years" },
        { value: "6-10", label: "6–10 years" },
        { value: "10+", label: "10+ years" },
      ],
    },
    {
      id: "english_test",
      prompt: "Have you completed an approved English language test?",
      helper: "IELTS, TOEFL, PTE, CELPIP.",
      options: [
        { value: "yes", label: "Yes, results in hand" },
        { value: "planning", label: "Planning to take one" },
        { value: "no", label: "Not yet" },
        { value: "native", label: "English is my native language" },
      ],
    },
    {
      id: "passport",
      prompt: "What's the status of your passport?",
      options: [
        { value: "valid_5", label: "Valid for 5+ years" },
        { value: "valid_2", label: "Valid for 1–2 years" },
        { value: "expiring", label: "Expiring soon" },
        { value: "none", label: "I don't have one yet" },
      ],
    },
    {
      id: "timeline",
      prompt: "When would you like to make the move?",
      options: [
        { value: "0-6", label: "Within 6 months" },
        { value: "6-12", label: "6–12 months" },
        { value: "1-2y", label: "1–2 years" },
        { value: "explore", label: "Just exploring for now" },
      ],
    },
    {
      id: "budget",
      prompt: "What's your approximate budget for this journey? (optional)",
      helper: "Fees, tests, relocation. This helps us prioritise realistic options.",
      optional: true,
      options: [
        { value: "<2k", label: "Under $2,000" },
        { value: "2-5k", label: "$2,000 – $5,000" },
        { value: "5-10k", label: "$5,000 – $10,000" },
        { value: "10k+", label: "$10,000+" },
        { value: "unsure", label: "I'm not sure yet" },
      ],
    },
  ];

  // Pathway-specific questions injected after base
  const pathway: Question[] = [];

  if (kind === "pr" && country === "Canada") {
    pathway.push({
      id: "eca",
      prompt: "Have you completed an Educational Credential Assessment (ECA)?",
      helper: "Required to have foreign education recognised by IRCC.",
      options: [
        { value: "yes", label: "Yes" },
        { value: "in_progress", label: "In progress" },
        { value: "no", label: "Not yet" },
        { value: "unsure", label: "Not sure what this is" },
      ],
    });
    pathway.push({
      id: "french",
      prompt: "Do you speak French?",
      helper: "French proficiency significantly boosts Express Entry scores.",
      options: [
        { value: "fluent", label: "Fluent" },
        { value: "some", label: "Some / learning" },
        { value: "none", label: "None" },
      ],
    });
  }

  if (country === "Germany") {
    pathway.push({
      id: "german",
      prompt: "What is your German language level?",
      options: [
        { value: "none", label: "None yet" },
        { value: "a1_a2", label: "A1 / A2 (beginner)" },
        { value: "b1_b2", label: "B1 / B2 (intermediate)" },
        { value: "c1_c2", label: "C1 / C2 (advanced)" },
      ],
    });
    pathway.push({
      id: "recognition",
      prompt: "Have you started qualification recognition (Anerkennung)?",
      options: [
        { value: "yes", label: "Yes, recognised" },
        { value: "in_progress", label: "In progress" },
        { value: "no", label: "Not yet" },
        { value: "na", label: "Not applicable to my field" },
      ],
    });
  }

  if (kind === "scholarship") {
    pathway.push({
      id: "grades",
      prompt: "How would you describe your academic performance?",
      options: [
        { value: "top", label: "Top of my class / First class" },
        { value: "upper", label: "Upper second / Distinction" },
        { value: "mid", label: "Solid middle of the pack" },
        { value: "varied", label: "Varied — stronger in some areas" },
      ],
    });
    pathway.push({
      id: "funding_need",
      prompt: "How much funding do you need?",
      options: [
        { value: "full", label: "Full — tuition and living" },
        { value: "tuition", label: "Tuition only" },
        { value: "partial", label: "Partial top-up" },
      ],
    });
    pathway.push({
      id: "intake",
      prompt: "Which intake are you targeting?",
      options: [
        { value: "next", label: "Next intake" },
        { value: "1y", label: "Within a year" },
        { value: "2y", label: "1–2 years out" },
      ],
    });
  }

  if (kind === "study") {
    pathway.push({
      id: "level",
      prompt: "What level of study are you aiming for?",
      options: [
        { value: "undergrad", label: "Undergraduate" },
        { value: "masters", label: "Masters" },
        { value: "phd", label: "PhD / Doctorate" },
        { value: "diploma", label: "Diploma / Certificate" },
      ],
    });
  }

  if (kind === "work") {
    pathway.push({
      id: "licence",
      prompt: "Does your profession require a professional licence?",
      options: [
        { value: "have", label: "Yes, and I have one" },
        { value: "need", label: "Yes, and I need to get one" },
        { value: "no", label: "No" },
        { value: "unsure", label: "Not sure" },
      ],
    });
  }

  // Family questions only if timeline is real (added always but marked relevant)
  const family: Question[] = [
    {
      id: "marital_status",
      prompt: "What is your marital status?",
      helper: "This can affect visa options and required documents.",
      options: [
        { value: "single", label: "Single" },
        { value: "married", label: "Married" },
        { value: "partnered", label: "In a long-term partnership" },
        { value: "prefer_not", label: "Prefer not to say" },
      ],
    },
    {
      id: "dependants",
      prompt: "Will any dependants relocate with you?",
      options: [
        { value: "none", label: "No dependants" },
        { value: "1", label: "1 dependant" },
        { value: "2", label: "2 dependants" },
        { value: "3+", label: "3 or more" },
      ],
    },
  ];

  return [...pathway, ...base, ...family];
}

function CompleteProfile() {
  const navigate = useNavigate();
  const [journey, setJourney] = useState<LastJourney | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("forme.last_journey");
      if (raw) setJourney(JSON.parse(raw));
      const rawA = localStorage.getItem(EXTRAS_KEY);
      if (rawA) setAnswers(JSON.parse(rawA));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const parsed = useMemo(() => {
    if (!journey) return { kind: undefined as string | undefined, country: undefined as string | undefined };
    try {
      const { kind, country } = parseJourneyId(journey.id);
      return { kind: kind as string, country };
    } catch {
      return { kind: journey.kind, country: journey.country };
    }
  }, [journey]);

  const questions = useMemo(() => buildQuestions(parsed.kind, parsed.country), [parsed.kind, parsed.country]);
  const total = questions.length;
  const q = questions[index];
  const isLast = index === total - 1;
  const progress = Math.round(((index + 1) / total) * 100);

  const persist = (next: Record<string, string>) => {
    setAnswers(next);
    try {
      localStorage.setItem(EXTRAS_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  };

  const answer = (value: string) => {
    const next = { ...answers, [q.id]: value };
    persist(next);
    if (isLast) {
      navigate({ to: "/dashboard" });
    } else {
      setIndex((i) => i + 1);
    }
  };

  const skip = () => {
    if (isLast) navigate({ to: "/dashboard" });
    else setIndex((i) => i + 1);
  };

  const back = () => {
    if (index === 0) navigate({ to: "/dashboard" });
    else setIndex((i) => i - 1);
  };

  if (!ready) return null;

  return (
    <div
      className="-mx-4 -my-6 min-h-[calc(100vh-4rem)] sm:-mx-8"
      style={{ background: T.card, color: T.text }}
    >
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={back}
            className="inline-flex items-center gap-1.5 text-sm"
            style={{ color: T.muted }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-[11px] uppercase tracking-[0.24em]" style={{ color: T.muted }}>
            {index + 1} of {total}
          </div>
        </div>

        <div className="mb-8 h-1 w-full overflow-hidden rounded-full" style={{ background: T.surface }}>
          <motion.div
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="h-full"
            style={{ background: T.primary }}
          />
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]"
               style={{ background: T.surface, color: T.primary }}>
            <Sparkles className="h-3 w-3" />
            Complete your profile
          </div>
          <h1 className="mt-4 text-[26px] font-semibold leading-tight tracking-tight sm:text-3xl" style={{ color: T.text }}>
            {journey?.displayName
              ? `A few more details to personalise ${journey.displayName}.`
              : "A few more details to personalise your journey."}
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: T.muted }}>
            We won't ask what you've already told us. These answers sharpen your recommendations and next actions.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl" style={{ color: T.text }}>
              {q.prompt}
            </h2>
            {q.helper && (
              <p className="mt-2 text-[14px]" style={{ color: T.muted }}>{q.helper}</p>
            )}

            <div className="mt-6 space-y-2.5">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => answer(opt.value)}
                    className="group flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition-all hover:-translate-y-0.5"
                    style={{
                      background: selected ? T.primary : T.card,
                      color: selected ? "#fff" : T.text,
                      border: `1px solid ${selected ? "transparent" : T.border}`,
                      boxShadow: selected
                        ? `0 12px 30px -12px ${T.primary}`
                        : "0 1px 2px rgba(30,30,46,0.04)",
                    }}
                  >
                    <span className="text-[15px] font-medium">{opt.label}</span>
                    {selected ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ArrowRight
                        className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              {q.optional ? (
                <button
                  onClick={skip}
                  className="text-[13px] underline-offset-4 hover:underline"
                  style={{ color: T.muted }}
                >
                  Skip this question
                </button>
              ) : <span />}
              {isLast && answers[q.id] && (
                <Button
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="h-11 rounded-full border-0 px-6 text-[14px] font-medium text-white"
                  style={{ background: T.primary }}
                >
                  Go to My World <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}