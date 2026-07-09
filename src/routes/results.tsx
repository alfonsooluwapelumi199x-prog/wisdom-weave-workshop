import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, MapPin } from "lucide-react";
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--violet),transparent_55%)] opacity-25" />
        <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--violet)] opacity-15 blur-[160px]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            <Sparkles className="h-3 w-3 text-lilac" />
            Your Opportunities
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            We found opportunities waiting for you.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-foreground/70">
            Your personalised journey is ready. Save your profile to unlock your full results and receive future opportunity updates.
          </p>

          {pending && (
            <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-foreground/60">
              {pending.countries_of_interest.slice(0, 6).map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1"
                >
                  <MapPin className="h-3 w-3 text-lilac" /> {c}
                </span>
              ))}
            </div>
          )}

          <Button
            onClick={save}
            size="lg"
            className="mt-10 h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{
              backgroundImage: "var(--gradient-primary)",
              boxShadow: "var(--shadow-premium)",
            }}
          >
            Save Your Journey <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
