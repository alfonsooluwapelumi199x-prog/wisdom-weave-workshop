import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My World · ForMe" }] }),
  component: Dashboard,
});

function Dashboard() {
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
            My World
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Welcome to your world.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-foreground/70">
            Your profile is saved. Your personalised opportunities are coming soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
