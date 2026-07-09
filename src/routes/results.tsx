import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/results")({
  head: () => ({ meta: [{ title: "Your Opportunities · ForMe" }] }),
  component: Results,
});

function Results() {
  return (
    <div className="relative -mx-4 -my-6 min-h-[calc(100vh-4rem)] overflow-hidden sm:-mx-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--violet),transparent_55%)] opacity-20" />
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            <Sparkles className="h-3 w-3 text-lilac" />
            Your Opportunities
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Your personalised journey is being prepared.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-foreground/70">
            We've captured your profile. The full results experience is coming soon.
          </p>
          <Link to="/onboarding" className="mt-10 inline-block">
            <Button variant="ghost" className="rounded-full text-foreground/70 hover:text-foreground">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Edit my profile
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}