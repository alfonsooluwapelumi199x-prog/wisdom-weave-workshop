import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, MapPin, GraduationCap, Briefcase, Globe2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [{ title: "Your Opportunities · ForMe" }] }),
  component: Results,
});

type Pending = {
  country_of_residence: string;
  nationality: string;
  qualification: string;
  occupation: string;
  main_goal: string;
  countries_of_interest: string[];
};

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

  const save = () => navigate({ to: "/auth" });

  const countries = pending?.countries_of_interest?.length
    ? pending.countries_of_interest
    : ["Canada", "Ireland", "Germany", "Australia", "New Zealand"];
  const goal = pending?.main_goal ?? "international opportunities";

  const pathIcons = [GraduationCap, Briefcase, Globe2];
  const pathLabels = ["Study pathway", "Work pathway", "Residency pathway"];

  const opportunities = countries.slice(0, 6).map((country, i) => ({
    country,
    match: 96 - i * 3,
    Icon: pathIcons[i % pathIcons.length],
    pathway: pathLabels[i % pathLabels.length],
    blurb: `A strong match for your ${goal.toLowerCase()} in ${country}.`,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--violet),transparent_55%)] opacity-25" />
        <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--violet)] opacity-15 blur-[160px]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            <Sparkles className="h-3 w-3 text-lilac" />
            Your Opportunities
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            We found opportunities waiting for you.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-foreground/70">
            Personalised matches based on your profile. Explore below, then save your journey to unlock full details.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {opportunities.map((o, i) => (
            <motion.div
              key={o.country + i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-sm transition-colors hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-foreground/85">
                  <MapPin className="h-4 w-4 text-lilac" />
                  <span className="font-medium">{o.country}</span>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-foreground/70">
                  {o.match}% match
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-foreground/55">
                <o.Icon className="h-3.5 w-3.5 text-lilac" />
                {o.pathway}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{o.blurb}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center text-center">
          <p className="max-w-md text-sm text-foreground/60">
            Save your journey to unlock full pathway details, eligibility, and future opportunity updates.
          </p>
          <Button
            onClick={save}
            size="lg"
            className="mt-5 h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{
              backgroundImage: "var(--gradient-primary)",
              boxShadow: "var(--shadow-premium)",
            }}
          >
            Save Your Journey <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
