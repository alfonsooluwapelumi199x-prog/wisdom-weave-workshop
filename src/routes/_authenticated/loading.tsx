import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Globe } from "@/components/marketing/globe";

export const Route = createFileRoute("/_authenticated/loading")({
  head: () => ({ meta: [{ title: "Searching · ForMe" }] }),
  component: LoadingExperience,
});

function LoadingExperience() {
  return (
    <div className="relative -mx-4 -my-6 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center sm:-mx-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--violet),transparent_55%)] opacity-25" />
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-[420px] opacity-90">
        <Globe compact />
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Searching the world for opportunities made for you…
      </motion.h1>
      <p className="mt-3 max-w-md text-sm text-foreground/60">
        Your personalised results are coming soon.
      </p>
      <Link to="/dashboard" className="mt-8 text-sm text-lilac hover:underline">
        Continue to dashboard →
      </Link>
    </div>
  );
}