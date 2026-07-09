import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Globe } from "@/components/marketing/globe";

export const Route = createFileRoute("/_authenticated/loading")({
  head: () => ({ meta: [{ title: "Searching · ForMe" }] }),
  component: DiscoveryExperience,
});

type Step = {
  message: string;
  duration: number;
  dots: number;
  focusPins?: string[];
};

const STEPS: Step[] = [
  {
    message: "Searching the world for opportunities made for you…",
    duration: 3000,
    dots: 1,
  },
  {
    message: "Understanding your profile…",
    duration: 3000,
    dots: 2,
  },
  {
    message: "Finding your strongest matches…",
    duration: 3000,
    dots: 3,
    focusPins: [
      "Toronto",
      "London",
      "Dublin",
      "Berlin",
      "Stockholm",
      "Sydney",
      "Auckland",
      "Singapore",
    ],
  },
  {
    message: "Building your personalised journey…",
    duration: 3000,
    dots: 4,
    focusPins: ["Toronto", "Dublin", "Berlin", "Sydney", "Auckland"],
  },
  {
    message: "We found opportunities waiting for you.",
    duration: 2000,
    dots: 4,
    focusPins: ["Toronto", "Dublin", "Berlin", "Sydney", "Auckland"],
  },
];

function DiscoveryExperience() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (stepIndex >= STEPS.length) return;
    const t = setTimeout(() => {
      if (stepIndex === STEPS.length - 1) {
        setExiting(true);
        setTimeout(() => navigate({ to: "/results" }), 900);
      } else {
        setStepIndex((i) => i + 1);
      }
    }, STEPS[stepIndex].duration);
    return () => clearTimeout(t);
  }, [stepIndex, navigate]);

  const current = STEPS[Math.min(stepIndex, STEPS.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background px-6"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,var(--violet),transparent_60%)] opacity-25" />
        <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--violet)] opacity-20 blur-[160px]" />
      </div>

      {/* Wordmark */}
      <div className="absolute left-6 top-6 text-xs uppercase tracking-[0.35em] text-foreground/40">
        ForMe
      </div>

      {/* Globe */}
      <div
        className="relative aspect-square"
        style={{ width: "min(78vmin, 720px)", height: "min(78vmin, 720px)" }}
      >
        <Globe mode="discovery" focusPins={current.focusPins} />
      </div>

      {/* Message */}
      <div className="relative mt-6 flex h-16 items-center justify-center px-4 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={current.message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl text-lg font-light tracking-tight text-foreground/85 sm:text-xl"
          >
            {current.message}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Milestone dots */}
      <div className="mt-6 flex items-center gap-3">
        {[1, 2, 3, 4].map((n) => {
          const filled = n <= current.dots;
          return (
            <motion.span
              key={n}
              animate={{
                opacity: filled ? 1 : 0.35,
                scale: filled ? 1 : 0.85,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-2 w-2 rounded-full"
              style={{
                background: filled ? "var(--violet)" : "transparent",
                border: filled ? "none" : "1px solid var(--lilac)",
                boxShadow: filled ? "0 0 12px var(--violet)" : "none",
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}