import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/marketing/globe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ForMe — Find the opportunities made for you." },
      {
        name: "description",
        content:
          "One profile. A world of opportunities matched to your education, experience, skills and goals.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <SectionTwo />
      <SectionThree />
      <SectionFour />
      <SectionFive />
      <Footer />
    </div>
  );
}

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
      <span className="relative grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-emerald text-primary-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-midnight" />
      </span>
      <span className="tracking-tight">ForMe</span>
    </Link>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Wordmark />
        <nav className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="rounded-full">Sign in</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="rounded-full px-4">Get Started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      {/* Ambient hero gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--violet),transparent_55%)] opacity-30" />
        <div className="absolute -top-32 right-[8%] h-[560px] w-[560px] rounded-full bg-violet/20 blur-[140px]" />
        <div className="absolute top-1/2 left-[-10%] h-[420px] w-[420px] rounded-full bg-lavender/10 blur-[140px]" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-20 pb-28 lg:grid-cols-12 lg:gap-8 lg:pt-28 lg:pb-36">
        {/* Copy */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-foreground/60 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-lilac shadow-[0_0_10px_var(--lilac)]" />
            A discovery platform for you
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-[5.25rem]"
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-soft-white via-lilac to-lavender bg-clip-text text-transparent">
              ForMe
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-8 text-2xl font-light leading-snug text-foreground/90 sm:text-[1.75rem]"
          >
            Find the opportunities made for you.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
          >
            One profile. Personalised opportunities. Clear next steps.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-6 max-w-lg border-l border-lilac/25 pl-4 text-[13px] italic leading-relaxed text-foreground/55"
          >
            Not an immigration agency. Not a job board. A discovery platform built around you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link to="/auth">
              <Button
                size="lg"
                className="group relative h-12 overflow-hidden rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundImage: "var(--gradient-primary)",
                  boxShadow: "var(--shadow-premium)",
                }}
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-60" />
                <span className="relative">Get Started</span>
                <span aria-hidden className="relative ml-1.5 transition-transform group-hover:translate-x-0.5">→</span>
              </Button>
            </Link>
            <a href="#how">
              <Button
                size="lg"
                variant="ghost"
                className="h-12 rounded-full border border-white/10 px-6 text-base font-medium text-foreground/85 hover:border-lilac/40 hover:bg-white/[0.04] hover:text-foreground"
              >
                See how it works
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Globe */}
        <div className="relative lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative mx-auto aspect-square w-full max-w-[580px]"
          >
            <Globe />

            {/* Floating location labels */}
            {[
              { name: "Canada", pos: "top-[14%] left-[6%]" },
              { name: "Sweden", pos: "top-[6%] left-[52%]" },
              { name: "Ireland", pos: "top-[22%] left-[38%]" },
              { name: "Germany", pos: "top-[38%] right-[8%]" },
              { name: "Australia", pos: "bottom-[10%] right-[10%]" },
            ].map((l, i) => (
              <motion.div
                key={l.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 + i * 0.15 }}
                className={`absolute ${l.pos} flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground/55`}
              >
                <span className="h-1 w-1 rounded-full bg-lilac shadow-[0_0_8px_var(--lilac)]" />
                {l.name}
              </motion.div>
            ))}
          </motion.div>

          {/* Searching status */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.4 }}
            className="mt-6 flex items-center justify-center gap-2.5 text-[12px] tracking-wide text-foreground/55"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-lilac"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ boxShadow: "0 0 12px var(--lilac)" }}
            />
            Searching the world for opportunities made for you…
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SectionTwo() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-28 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        Stop searching country by country.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
      >
        ForMe looks at your profile first. Then helps you discover international opportunities
        that genuinely fit you — whether your goal is work, study, employer sponsorship,
        scholarships or something you haven't considered yet. The platform searches based on
        who you are, not just where you want to go.
      </motion.p>
    </section>
  );
}

function SectionThree() {
  const cards = [
    {
      title: "Why is this recommended for me?",
      body: "Understand exactly why an opportunity fits your profile. No guessing.",
      tint: "from-primary/25 to-primary/0",
    },
    {
      title: "What's my next action?",
      body: "Always know the one thing to do next. No overwhelming checklists.",
      tint: "from-emerald/25 to-emerald/0",
    },
    {
      title: "How close am I to my goal?",
      body: "Follow your journey with clear milestones instead of confusion.",
      tint: "from-gold/25 to-gold/0",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur-sm"
          >
            <div className={`pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${c.tint} blur-3xl`} />
            <h3 className="text-2xl font-semibold tracking-tight">{c.title}</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{c.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SectionFour() {
  const steps = [
    { n: "01", title: "Create one profile", body: "Tell us about your education, experience, goals and interests." },
    { n: "02", title: "Discover your strongest matches", body: "Receive personalised recommendations from around the world." },
    { n: "03", title: "Take your next step", body: "Every recommendation includes one clear next action so you always know what to do." },
  ];
  return (
    <section id="how" className="mx-auto max-w-5xl px-6 py-28">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-center text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        How ForMe works
      </motion.h2>
      <div className="mt-16 space-y-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className="flex items-start gap-6 rounded-3xl border border-white/8 bg-white/[0.02] p-8 md:items-center"
          >
            <span className="font-mono text-sm text-primary/80">{s.n}</span>
            <div className="flex-1">
              <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SectionFive() {
  const journey = [
    { label: "Degree", done: true },
    { label: "Experience", done: true },
    { label: "English Test", done: false },
    { label: "Credential Assessment", done: false },
    { label: "Application", done: false },
  ];
  const journey2 = [
    { label: "Language", done: true },
    { label: "Job Offer", done: false },
    { label: "Blue Card Application", done: false },
  ];
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-center text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        Your World
      </motion.h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        A quiet, personal view of the world — organised around your journey.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9 }}
        className="mt-14 grid gap-6 rounded-[2rem] border border-white/8 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.7)] backdrop-blur-sm md:p-10 lg:grid-cols-2"
      >
        <div className="relative aspect-square w-full max-w-[520px] justify-self-center">
          <Globe compact highlighted={["Canada", "Germany", "Australia"]} />
        </div>
        <div className="flex flex-col justify-center gap-4">
          <CountryCard flag="🇨🇦" name="Canada" tag="Great Match" tagColor="emerald" next="Complete your English test" milestones={journey} />
          <CountryCard flag="🇩🇪" name="Germany" tag="Strong Fit" tagColor="primary" next="Secure a qualifying job offer" milestones={journey2} />
        </div>
      </motion.div>
    </section>
  );
}

function CountryCard({
  flag,
  name,
  tag,
  tagColor,
  next,
  milestones,
}: {
  flag: string;
  name: string;
  tag: string;
  tagColor: "emerald" | "primary" | "gold";
  next: string;
  milestones: { label: string; done: boolean }[];
}) {
  const tagClasses = {
    emerald: "bg-emerald/15 text-emerald",
    primary: "bg-primary/15 text-primary",
    gold: "bg-gold/15 text-gold",
  }[tagColor];
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/8 bg-background/60 p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{flag}</span>
          <span className="text-lg font-semibold tracking-tight">{name}</span>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${tagClasses}`}>{tag}</span>
      </div>
      <div className="mt-5 rounded-xl border border-white/6 bg-white/[0.02] p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Next Action</div>
        <div className="mt-1 text-sm font-medium">{next}</div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Journey</div>
        <ul className="space-y-1.5">
          {milestones.map((m) => (
            <li key={m.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${
                  m.done
                    ? "bg-emerald/20 text-emerald"
                    : "border border-white/15 text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={m.done ? "text-foreground" : "text-muted-foreground"}>{m.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <Wordmark />
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">About</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
