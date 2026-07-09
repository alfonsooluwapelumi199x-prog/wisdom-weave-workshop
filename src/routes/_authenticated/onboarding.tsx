import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Search,
  Stethoscope,
  Wrench,
  GraduationCap,
  Code2,
  Briefcase,
  Hammer,
  FlaskConical,
  Palette,
  UtensilsCrossed,
  BookOpen,
  MoreHorizontal,
  Globe2,
  Plane,
  Home,
  Award,
  Sparkles,
  Compass,
  Pencil,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { saveOnboarding } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe } from "@/components/marketing/globe";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Build your profile · ForMe" }] }),
  component: Onboarding,
});

type Answers = {
  country_of_residence: string;
  nationality: string;
  qualification: string;
  profession: string;
  main_goal: string;
  countries_of_interest: string[];
};

const EMPTY: Answers = {
  country_of_residence: "",
  nationality: "",
  qualification: "",
  profession: "",
  main_goal: "",
  countries_of_interest: [],
};

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Bangladesh","Belgium","Bolivia","Brazil","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia","Croatia","Czechia","Denmark","Egypt","Estonia","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Libya","Lithuania","Luxembourg","Malaysia","Mexico","Moldova","Morocco","Nepal","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

const QUALIFICATIONS = [
  "Secondary School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

const PROFESSIONS: { label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Healthcare", Icon: Stethoscope },
  { label: "Engineering", Icon: Wrench },
  { label: "Education", Icon: GraduationCap },
  { label: "Technology", Icon: Code2 },
  { label: "Business", Icon: Briefcase },
  { label: "Trades", Icon: Hammer },
  { label: "Science", Icon: FlaskConical },
  { label: "Arts", Icon: Palette },
  { label: "Hospitality", Icon: UtensilsCrossed },
  { label: "Student", Icon: BookOpen },
  { label: "Other", Icon: MoreHorizontal },
];

const GOALS: { label: string; Icon: React.ComponentType<{ className?: string }>; hint: string }[] = [
  { label: "Work Abroad", Icon: Plane, hint: "Sponsored jobs & work visas" },
  { label: "Permanent Residence", Icon: Home, hint: "Long-term settlement pathways" },
  { label: "Study Abroad", Icon: GraduationCap, hint: "Universities & study pathways" },
  { label: "Scholarships", Icon: Award, hint: "Fully & partially funded programs" },
  { label: "Explore Opportunities", Icon: Sparkles, hint: "See what's out there for you" },
  { label: "Not Sure Yet", Icon: Compass, hint: "We'll help you figure it out" },
];

const INTEREST_COUNTRIES: { name: string; flag: string }[] = [
  { name: "Canada", flag: "🇨🇦" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "Ireland", flag: "🇮🇪" },
  { name: "United States", flag: "🇺🇸" },
  { name: "New Zealand", flag: "🇳🇿" },
  { name: "Other", flag: "🌍" },
];

const TOTAL_QUESTIONS = 6;

function Onboarding() {
  const navigate = useNavigate();
  const save = useServerFn(saveOnboarding);
  // step: 0 = intro, 1..6 = questions, 7 = review
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Answers>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) =>
    setAns((prev) => ({ ...prev, [k]: v }));

  const canContinue = useMemo(() => {
    switch (step) {
      case 1: return !!ans.country_of_residence;
      case 2: return !!ans.nationality;
      case 3: return !!ans.qualification;
      case 4: return !!ans.profession;
      case 5: return !!ans.main_goal;
      case 6: return ans.countries_of_interest.length > 0;
      default: return true;
    }
  }, [step, ans]);

  const goNext = () => setStep((s) => Math.min(s + 1, 7));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      await save({
        data: {
          country_of_residence: ans.country_of_residence,
          nationality: ans.nationality,
          qualification: ans.qualification,
          occupation: ans.profession,
          main_goal: ans.main_goal,
          countries_of_interest: ans.countries_of_interest,
        },
      });
      navigate({ to: "/loading" });
    } catch (err) {
      toast.error((err as Error).message);
      setSubmitting(false);
    }
  };

  const progress = step === 0 ? 0 : Math.min(step, TOTAL_QUESTIONS) / TOTAL_QUESTIONS;

  return (
    <div className="relative -mx-4 -my-6 min-h-[calc(100vh-4rem)] overflow-hidden sm:-mx-6">
      {/* Ambient globe backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--violet),transparent_55%)] opacity-20" />
        <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 opacity-[0.18]">
          <Globe compact />
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col px-5 pb-10 pt-6 sm:px-6">
        {/* Progress */}
        {step > 0 && step <= TOTAL_QUESTIONS && (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-foreground/55">
              <span>Step {step} of {TOTAL_QUESTIONS}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundImage: "var(--gradient-primary)" }}
                initial={false}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex flex-1 flex-col"
            >
              {step === 0 && <Intro onBegin={goNext} />}

              {step === 1 && (
                <QuestionShell title="Where do you currently live?" subtitle="This helps us understand your starting point.">
                  <CountrySelect value={ans.country_of_residence} onChange={(v) => set("country_of_residence", v)} />
                </QuestionShell>
              )}

              {step === 2 && (
                <QuestionShell title="What is your nationality?" subtitle="Your passport shapes your options.">
                  <CountrySelect value={ans.nationality} onChange={(v) => set("nationality", v)} />
                </QuestionShell>
              )}

              {step === 3 && (
                <QuestionShell title="What's your highest qualification?">
                  <CardGrid columns={2}>
                    {QUALIFICATIONS.map((q) => (
                      <SelectCard key={q} selected={ans.qualification === q} onClick={() => set("qualification", q)}>
                        <span className="text-base font-medium">{q}</span>
                      </SelectCard>
                    ))}
                  </CardGrid>
                </QuestionShell>
              )}

              {step === 4 && (
                <QuestionShell title="Which best describes your profession?">
                  <CardGrid columns={2}>
                    {PROFESSIONS.map(({ label, Icon }) => (
                      <SelectCard key={label} selected={ans.profession === label} onClick={() => set("profession", label)}>
                        <Icon className="mb-2 h-6 w-6 text-lilac" />
                        <span className="text-sm font-medium">{label}</span>
                      </SelectCard>
                    ))}
                  </CardGrid>
                </QuestionShell>
              )}

              {step === 5 && (
                <QuestionShell title="What is your main goal?">
                  <div className="space-y-3">
                    {GOALS.map(({ label, Icon, hint }) => (
                      <SelectCard key={label} selected={ans.main_goal === label} onClick={() => set("main_goal", label)} row>
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lilac/10 text-lilac">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 text-left">
                          <span className="block text-base font-medium">{label}</span>
                          <span className="block text-[13px] text-foreground/55">{hint}</span>
                        </span>
                      </SelectCard>
                    ))}
                  </div>
                </QuestionShell>
              )}

              {step === 6 && (
                <QuestionShell title="Which countries interest you most?" subtitle="Pick as many as you like.">
                  <CardGrid columns={2}>
                    {INTEREST_COUNTRIES.map(({ name, flag }) => {
                      const selected = ans.countries_of_interest.includes(name);
                      return (
                        <SelectCard
                          key={name}
                          selected={selected}
                          onClick={() =>
                            set(
                              "countries_of_interest",
                              selected
                                ? ans.countries_of_interest.filter((c) => c !== name)
                                : [...ans.countries_of_interest, name],
                            )
                          }
                        >
                          <span className="text-3xl leading-none">{flag}</span>
                          <span className="mt-2 text-sm font-medium">{name}</span>
                        </SelectCard>
                      );
                    })}
                  </CardGrid>
                </QuestionShell>
              )}

              {step === 7 && <Review answers={ans} onEdit={(s) => setStep(s)} />}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="mt-10 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button variant="ghost" onClick={goBack} className="rounded-full text-foreground/70 hover:text-foreground">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
            ) : (
              <span />
            )}

            {step === 0 ? null : step === 7 ? (
              <PrimaryButton onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Discover My Opportunities
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={goNext} disabled={!canContinue}>
                Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Intro({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-foreground/60">
        <span className="h-1.5 w-1.5 rounded-full bg-lilac shadow-[0_0_10px_var(--lilac)]" />
        Step 1 of {TOTAL_QUESTIONS}
      </div>
      <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
        Build My Profile
      </h1>
      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-foreground/70">
        Six quick questions. Then we'll search the world for opportunities made for you.
      </p>
      <PrimaryButton onClick={onBegin} className="mt-10">
        Begin <ArrowRight className="ml-1.5 h-4 w-4" />
      </PrimaryButton>
    </div>
  );
}

function QuestionShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-balance text-[26px] font-semibold leading-tight tracking-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-[14px] text-foreground/60">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function CardGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) {
  return (
    <div className={`grid gap-3 ${columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
      {children}
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  children,
  row = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  row?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex overflow-hidden rounded-2xl border p-4 text-left transition-all",
        row ? "items-center gap-3" : "flex-col items-start justify-center min-h-[104px]",
        selected
          ? "border-lilac/60 bg-lilac/10 shadow-[0_10px_40px_-20px_var(--violet)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
      ].join(" ")}
    >
      {children}
      <span
        className={[
          "absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full transition-all",
          selected ? "bg-lilac text-midnight" : "bg-white/5 text-transparent",
        ].join(" ")}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </button>
  );
}

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return COUNTRIES;
    return COUNTRIES.filter((c) => c.toLowerCase().includes(term));
  }, [q]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search countries"
          className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-base"
        />
      </div>
      {value && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-lilac/40 bg-lilac/10 px-3 py-1 text-sm">
          <Globe2 className="h-3.5 w-3.5 text-lilac" />
          {value}
        </div>
      )}
      <div className="mt-4 max-h-[46vh] overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.02]">
        <ul className="divide-y divide-white/5">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-foreground/50">No matches</li>
          )}
          {filtered.map((c) => {
            const selected = value === c;
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => onChange(c)}
                  className={[
                    "flex w-full items-center justify-between px-4 py-3 text-left text-[15px] transition-colors",
                    selected ? "bg-lilac/10 text-foreground" : "hover:bg-white/[0.04]",
                  ].join(" ")}
                >
                  <span>{c}</span>
                  {selected && <Check className="h-4 w-4 text-lilac" strokeWidth={3} />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Review({ answers, onEdit }: { answers: Answers; onEdit: (step: number) => void }) {
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Living in", value: answers.country_of_residence, step: 1 },
    { label: "Nationality", value: answers.nationality, step: 2 },
    { label: "Qualification", value: answers.qualification, step: 3 },
    { label: "Profession", value: answers.profession, step: 4 },
    { label: "Main goal", value: answers.main_goal, step: 5 },
    { label: "Countries of interest", value: answers.countries_of_interest.join(", "), step: 6 },
  ];
  return (
    <div>
      <h2 className="text-balance text-[26px] font-semibold leading-tight tracking-tight sm:text-3xl">
        Looks good?
      </h2>
      <p className="mt-2 text-[14px] text-foreground/60">
        Review your answers. You can edit anything before we search.
      </p>
      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-soft-white/[0.03] backdrop-blur">
        <ul className="divide-y divide-white/6">
          {rows.map((r) => (
            <li key={r.label} className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/50">{r.label}</div>
                <div className="mt-1 truncate text-[15px] font-medium">{r.value || "—"}</div>
              </div>
              <button
                type="button"
                onClick={() => onEdit(r.step)}
                className="shrink-0 rounded-full border border-white/10 p-2 text-foreground/60 transition-colors hover:border-lilac/40 hover:text-lilac"
                aria-label={`Edit ${r.label}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className={[
        "group relative h-12 overflow-hidden rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50",
        className,
      ].join(" ")}
      style={{
        backgroundImage: "var(--gradient-primary)",
        boxShadow: "var(--shadow-premium)",
      }}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-60" />
      <span className="relative inline-flex items-center">{children}</span>
    </Button>
  );
}