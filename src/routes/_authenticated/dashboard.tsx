import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Compass, Sparkles, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { tokens as T } from "@/components/forme";

type LastJourney = {
  id: string;
  kind: string;
  country?: string;
  displayName: string;
  flag?: string;
  currentTitle: string;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My World · ForMe" }] }),
  component: MyWorld,
});

function MyWorld() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");
  const [journey, setJourney] = useState<LastJourney | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const full = (data.user?.user_metadata?.full_name as string | undefined) ?? data.user?.email ?? "";
      setFirstName(full.split(/[\s@]/)[0] ?? "");
    });
    try {
      const raw = localStorage.getItem("forme.last_journey");
      if (raw) setJourney(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const upcoming = journey
    ? ["English Test", "Educational Credential Assessment", "Application Profile"]
    : [];

  return (
    <div
      className="-mx-4 -my-6 min-h-[calc(100vh-4rem)] sm:-mx-8"
      style={{ background: T.card, color: T.text }}
    >
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.28em]"
               style={{ background: T.surface, color: T.primary }}>
            <Sparkles className="h-3 w-3" /> My World
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: T.text }}>
            Welcome back{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: T.muted }}>
            You're one step closer today.
          </p>
        </motion.header>

        {/* Continue My Journey */}
        <Section title="Continue My Journey">
          {journey ? (
            <div
              className="rounded-3xl p-7 sm:p-8"
              style={{
                background: `linear-gradient(180deg, ${T.card} 0%, ${T.surface} 100%)`,
                border: `1px solid ${T.border}`,
                boxShadow: "0 2px 4px rgba(30,30,46,0.04), 0 20px 40px -20px rgba(139,92,246,0.20)",
              }}
            >
              <div className="flex items-center gap-3">
                {journey.flag && <span className="text-3xl leading-none" aria-hidden>{journey.flag}</span>}
                <div>
                  <div className="text-lg font-semibold" style={{ color: T.text }}>
                    {journey.country ?? "Your opportunity"}
                  </div>
                  <div className="text-[14px]" style={{ color: T.muted }}>{journey.displayName}</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.primary }}>Current Step</div>
                <div className="mt-1.5 text-[17px] font-medium" style={{ color: T.text }}>
                  {journey.currentTitle}
                </div>
              </div>
              <Button
                onClick={() => navigate({ to: "/journey/$id", params: { id: journey.id } })}
                size="lg"
                className="mt-6 h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
                style={{ background: T.primary, boxShadow: `0 12px 30px -12px ${T.primary}` }}
              >
                Continue Journey <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <EmptyCard
              text="You haven't started a journey yet. Explore your recommended opportunities."
              cta="Explore Opportunities"
              onCta={() => navigate({ to: "/results" })}
            />
          )}
        </Section>

        {/* My Opportunities */}
        <Section title="My Opportunities">
          <div className="flex flex-wrap gap-2">
            {["Saved", "Recently Viewed", "Recommended", "Archived"].map((tab, i) => (
              <button
                key={tab}
                className="rounded-full px-4 py-2 text-[13px] transition"
                style={{
                  background: i === 0 ? T.primary : T.surface,
                  color: i === 0 ? "#fff" : T.text,
                  border: `1px solid ${i === 0 ? "transparent" : T.border}`,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            className="mt-4 rounded-2xl p-6 text-[14px]"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.muted }}
          >
            {journey
              ? `${journey.displayName} — saved from your Opportunity Plan.`
              : "Opportunities you save will appear here."}
          </div>
        </Section>

        {/* Upcoming Steps */}
        {upcoming.length > 0 && (
          <Section title="Upcoming Steps">
            <div
              className="rounded-2xl p-6"
              style={{ background: T.card, border: `1px solid ${T.border}` }}
            >
              <ol className="space-y-3">
                {upcoming.map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span
                      className="grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold"
                      style={{ background: T.surface, color: T.primary, border: `1px solid ${T.border}` }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[15px]" style={{ color: T.text }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Section>
        )}

        {/* Complete Your Profile */}
        <Section title="Complete Your Profile">
          <div
            className="flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: T.card, color: T.primary, border: `1px solid ${T.border}` }}>
                <UserCog className="h-4 w-4" />
              </span>
              <p className="text-[15px] leading-relaxed" style={{ color: T.text }}>
                Complete your profile to unlock more accurate recommendations.
              </p>
            </div>
            <Button
              onClick={() => navigate({ to: "/complete-profile" })}
              className="h-11 shrink-0 rounded-full border-0 px-6 text-[14px] font-medium text-white"
              style={{ background: T.primary }}
            >
              Complete Profile
            </Button>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <div
            className="divide-y rounded-2xl"
            style={{ background: T.card, border: `1px solid ${T.border}`, borderColor: T.border }}
          >
            {[
              "A new opportunity matches your profile.",
              "Your next step is ready.",
              "A scholarship deadline is approaching.",
            ].map((n) => (
              <div key={n} className="flex items-start gap-3 p-4" style={{ borderColor: T.border }}>
                <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-full" style={{ background: T.surface, color: T.primary }}>
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <p className="text-[14px]" style={{ color: T.text }}>{n}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Weekly Discovery */}
        <Section title="Weekly Discovery">
          <div
            className="rounded-3xl p-7"
            style={{
              background: `linear-gradient(180deg, ${T.surface} 0%, ${T.card} 100%)`,
              border: `1px solid ${T.border}`,
            }}
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]" style={{ color: T.primary }}>
              <Compass className="h-3.5 w-3.5" /> This week
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight" style={{ color: T.text }}>
              A new opportunity picked for you
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: T.muted }}>
              We'll surface one carefully chosen opportunity here each week — based on your profile, so you never feel overwhelmed.
            </p>
            <Button
              onClick={() => navigate({ to: "/results" })}
              variant="ghost"
              className="mt-5 h-11 rounded-full px-5 text-[14px] font-medium hover:bg-transparent"
              style={{ color: T.primary }}
            >
              See this week's pick <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 text-[11px] uppercase tracking-[0.28em]" style={{ color: T.muted }}>
        {title}
      </div>
      {children}
    </section>
  );
}

function EmptyCard({ text, cta, onCta }: { text: string; cta: string; onCta: () => void }) {
  return (
    <div
      className="rounded-2xl p-6 text-center"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      <p className="text-[14px]" style={{ color: T.muted }}>{text}</p>
      <Button
        onClick={onCta}
        className="mt-4 h-11 rounded-full border-0 px-6 text-[14px] font-medium text-white"
        style={{ background: T.primary }}
      >
        {cta}
      </Button>
    </div>
  );
}
