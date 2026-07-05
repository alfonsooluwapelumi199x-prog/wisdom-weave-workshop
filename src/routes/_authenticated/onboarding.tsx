import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { saveOnboarding } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding · Pelumi" }] }),
  component: Onboarding,
});

type Answers = {
  full_name: string;
  age: string;
  nationality: string;
  country_of_residence: string;
  qualification: string;
  occupation: string;
  years_experience: string;
  marital_status: string;
  countries_of_interest: string;
};

const initial: Answers = {
  full_name: "",
  age: "",
  nationality: "",
  country_of_residence: "",
  qualification: "",
  occupation: "",
  years_experience: "",
  marital_status: "",
  countries_of_interest: "",
};

function Onboarding() {
  const navigate = useNavigate();
  const save = useServerFn(saveOnboarding);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Answers>(initial);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) =>
    setAns((prev) => ({ ...prev, [k]: v }));

  const steps: Array<{
    title: string;
    subtitle?: string;
    render: () => React.ReactNode;
    valid: () => boolean;
  }> = [
    {
      title: "What should we call you?",
      render: () => <Input autoFocus placeholder="Your full name" value={ans.full_name} onChange={(e) => set("full_name", e.target.value)} />,
      valid: () => ans.full_name.trim().length >= 2,
    },
    {
      title: "How old are you?",
      render: () => <Input autoFocus type="number" min={13} max={100} placeholder="e.g. 28" value={ans.age} onChange={(e) => set("age", e.target.value)} />,
      valid: () => Number(ans.age) >= 13 && Number(ans.age) <= 100,
    },
    {
      title: "What's your nationality?",
      render: () => <Input autoFocus placeholder="e.g. Nigerian" value={ans.nationality} onChange={(e) => set("nationality", e.target.value)} />,
      valid: () => ans.nationality.trim().length > 1,
    },
    {
      title: "Where do you currently live?",
      render: () => <Input autoFocus placeholder="Country of residence" value={ans.country_of_residence} onChange={(e) => set("country_of_residence", e.target.value)} />,
      valid: () => ans.country_of_residence.trim().length > 1,
    },
    {
      title: "Your highest qualification?",
      render: () => (
        <Select value={ans.qualification} onValueChange={(v) => set("qualification", v)}>
          <SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger>
          <SelectContent>
            {["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Professional Certification"].map((q) => (
              <SelectItem key={q} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
      valid: () => !!ans.qualification,
    },
    {
      title: "What's your occupation or field?",
      render: () => <Input autoFocus placeholder="e.g. Software Engineer, Registered Nurse" value={ans.occupation} onChange={(e) => set("occupation", e.target.value)} />,
      valid: () => ans.occupation.trim().length > 1,
    },
    {
      title: "Years of professional experience?",
      render: () => <Input autoFocus type="number" min={0} max={60} placeholder="e.g. 5" value={ans.years_experience} onChange={(e) => set("years_experience", e.target.value)} />,
      valid: () => Number(ans.years_experience) >= 0 && ans.years_experience !== "",
    },
    {
      title: "Marital status?",
      render: () => (
        <Select value={ans.marital_status} onValueChange={(v) => set("marital_status", v)}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            {["Single", "Married", "Partnered", "Divorced", "Widowed", "Prefer not to say"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
      valid: () => !!ans.marital_status,
    },
    {
      title: "Which countries interest you?",
      subtitle: "Comma-separated. Example: Canada, UK, Germany",
      render: () => <Input autoFocus placeholder="Canada, UK, Germany" value={ans.countries_of_interest} onChange={(e) => set("countries_of_interest", e.target.value)} />,
      valid: () => ans.countries_of_interest.split(",").filter((s) => s.trim()).length >= 1,
    },
  ];

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const next = async () => {
    if (!current.valid()) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    setSubmitting(true);
    try {
      await save({
        data: {
          full_name: ans.full_name.trim(),
          age: Number(ans.age),
          nationality: ans.nationality.trim(),
          country_of_residence: ans.country_of_residence.trim(),
          qualification: ans.qualification,
          occupation: ans.occupation.trim(),
          years_experience: Number(ans.years_experience),
          marital_status: ans.marital_status,
          countries_of_interest: ans.countries_of_interest.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      toast.success("Profile saved. Generating your opportunities…");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-border/60 bg-card p-8"
        >
          <Label className="text-2xl font-semibold tracking-tight">{current.title}</Label>
          {current.subtitle && <p className="mt-1 text-sm text-muted-foreground">{current.subtitle}</p>}
          <div className="mt-6">{current.render()}</div>
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={next} disabled={!current.valid() || submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {step === steps.length - 1 ? "Finish" : "Next"}
              {step < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}