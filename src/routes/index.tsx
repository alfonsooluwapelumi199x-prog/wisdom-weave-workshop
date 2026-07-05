import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Compass, GraduationCap, Briefcase, Plane, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="h-4 w-4" />
            </span>
            <span>Pelumi</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-40 right-0 h-[360px] w-[360px] rounded-full bg-accent/25 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Personalized by AI. Grounded in official sources.
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl"
          >
            Your next{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              international opportunity
            </span>{" "}
            starts here.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Pelumi matches you to scholarships, sponsored jobs, and skilled worker pathways abroad —
            tailored to your profile, with next steps and official links.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/auth">
              <Button size="lg" className="h-12 px-6 text-base">
                Find my opportunities
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                How it works
              </Button>
            </a>
          </motion.div>
          <p className="mt-4 text-xs text-muted-foreground">
            Educational information only — never a guarantee of eligibility.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: GraduationCap, title: "Scholarships", desc: "Chevening, DAAD, Fulbright, MEXT and more, matched to your background." },
            { icon: Briefcase, title: "Sponsored jobs", desc: "Employers that sponsor skilled worker visas in the UK, Canada, EU and beyond." },
            { icon: Plane, title: "Visa pathways", desc: "Express Entry, Skilled Worker, Blue Card — see what actually fits." },
            { icon: ShieldCheck, title: "Official sources", desc: "Every suggestion links back to a government or program page you can verify." },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_10px_30px_-15px_rgba(0,0,0,0.6)]"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pelumi. Educational tool — not immigration or legal advice.
      </footer>
    </div>
  );
}
