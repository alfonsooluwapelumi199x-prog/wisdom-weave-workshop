import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Bookmark, Archive, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { tokens as T, ConfidenceCard } from "@/components/forme";
import {
  resolveBlueprint,
  currentStep,
  COUNTRY_FLAG,
  type Kind,
  type Pending,
} from "@/lib/opportunity-plans";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My World · ForMe" }] }),
  component: MyWorld,
});

type OppStatus = "active" | "saved" | "recommended" | "exploring" | "archived";

type Opportunity = {
  id: string;
  kind: Kind;
  country?: string;
  flag?: string;
  displayName: string;
  status: OppStatus;
};

type LastJourney = {
  id: string;
  kind: Kind;
  country?: string;
  displayName: string;
  flag?: string;
  currentTitle: string;
};

const KIND_LABEL: Record<Kind, string> = {
  pr: "Permanent Residence",
  work: "Work",
  study: "Study",
  scholarship: "Scholarship",
};

const STATUS_STYLE: Record<OppStatus, { label: string; bg: string; color: string }> = {
  active: { label: "Active Journey", bg: "#EFE7FF", color: T.primary },
  saved: { label: "Saved", bg: "#E7F8F0", color: T.success },
  recommended: { label: "Recommended", bg: T.surface, color: T.primary },
  exploring: { label: "Exploring", bg: "#FDF3E7", color: T.warning },
  archived: { label: "Archived", bg: "#F3F0FA", color: T.muted },
};

function buildOpportunitiesFromProfile(p: Pending): Opportunity[] {
  const goal = p.main_goal ?? "";
  const interests = (p.countries_of_interest ?? []).filter((c) => c !== "Other");
  const worldwide = interests.length === 0;
  const targets = worldwide
    ? ["Canada", "Germany", "Australia", "United Kingdom", "Ireland"]
    : interests;

  const kinds: Kind[] =
    goal === "Permanent Residence" ? ["pr"] :
    goal === "Work Abroad" ? ["work"] :
    goal === "Study Abroad" ? ["study"] :
    goal === "Scholarships" ? ["scholarship"] :
    ["pr", "work", "study"];

  const list: Opportunity[] = [];
  for (const kind of kinds) {
    for (const country of targets) {
      const bp = resolveBlueprint(kind, country);
      list.push({
        id: `${kind}-${country.toLowerCase().replace(/\s+/g, "-")}`,
        kind,
        country,
        flag: COUNTRY_FLAG[country],
        displayName: bp.displayName,
        status: "recommended",
      });
    }
  }
  return list;
}

type StoredRec = {
  id: string;
  kind: Kind;
  country?: string;
  flag?: string;
  displayName: string;
};

function mergeRecommendations(profileList: Opportunity[], stored: StoredRec[]): Opportunity[] {
  const map = new Map<string, Opportunity>();
  for (const o of profileList) map.set(o.id, o);
  for (const r of stored) {
    if (!map.has(r.id)) {
      map.set(r.id, {
        id: r.id,
        kind: r.kind,
        country: r.country,
        flag: r.flag,
        displayName: r.displayName,
        status: "recommended",
      });
    }
  }
  return Array.from(map.values());
}

function shortDescription(kind: Kind, country?: string): string {
  const c = country ?? "your target country";
  switch (kind) {
    case "pr": return `A structured pathway to permanent residence in ${c}.`;
    case "work": return `Employer-sponsored work routes into ${c}.`;
    case "study": return `Study pathways with post-study opportunities in ${c}.`;
    case "scholarship": return `Funded study opportunities available in ${c}.`;
  }
}

function MyWorld() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");
  const [pending, setPending] = useState<Pending>({});
  const [statusMap, setStatusMap] = useState<Record<string, OppStatus>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastJourney, setLastJourney] = useState<LastJourney | null>(null);
  const [storedRecs, setStoredRecs] = useState<StoredRec[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const full = (data.user?.user_metadata?.full_name as string | undefined) ?? data.user?.email ?? "";
      setFirstName(full.split(/[\s@]/)[0] ?? "");
    });
    try {
      const p = localStorage.getItem("forme.pending_profile");
      if (p) setPending(JSON.parse(p));
      const s = localStorage.getItem("forme.opportunity_status");
      if (s) setStatusMap(JSON.parse(s));
      const a = localStorage.getItem("forme.active_opportunity");
      if (a) setActiveId(a);
      const lj = localStorage.getItem("forme.last_journey");
      if (lj) setLastJourney(JSON.parse(lj));
      const rec = localStorage.getItem("forme.recommendations");
      if (rec) setStoredRecs(JSON.parse(rec));
    } catch { /* ignore */ }
  }, []);

  const opportunities = useMemo<Opportunity[]>(() => {
    const profileList = buildOpportunitiesFromProfile(pending);
    const base = mergeRecommendations(profileList, storedRecs);
    // Ensure last journey is included even if outside profile targets
    if (lastJourney && !base.find((o) => o.id === lastJourney.id)) {
      base.unshift({
        id: lastJourney.id,
        kind: lastJourney.kind,
        country: lastJourney.country,
        flag: lastJourney.flag,
        displayName: lastJourney.displayName,
        status: "recommended",
      });
    }
    return base
      .map((o) => ({ ...o, status: (o.id === activeId ? "active" : statusMap[o.id]) ?? o.status }));
  }, [pending, storedRecs, statusMap, activeId, lastJourney]);

  const active = opportunities.find((o) => o.status === "active") ?? null;
  const activeBlueprint = active ? resolveBlueprint(active.kind, active.country) : null;
  const activeStep = activeBlueprint ? currentStep(activeBlueprint, activeBlueprint.deriveStatuses({ profile: pending, answers: {}, country: active?.country, kind: active!.kind })) : null;

  const upcomingSteps = activeBlueprint?.steps.slice(0, 3) ?? [];

  const weekly = useMemo<Opportunity | null>(() => {
    const pool = opportunities.filter((o) => o.status === "recommended" && o.id !== active?.id);
    return pool[0] ?? null;
  }, [opportunities, active]);

  const nonArchived = opportunities.filter((o) => o.status !== "archived");
  const archived = opportunities.filter((o) => o.status === "archived");

  const persistStatus = (next: Record<string, OppStatus>) => {
    setStatusMap(next);
    try { localStorage.setItem("forme.opportunity_status", JSON.stringify(next)); } catch { /* ignore */ }
  };
  const persistActive = (id: string | null) => {
    setActiveId(id);
    try {
      if (id) localStorage.setItem("forme.active_opportunity", id);
      else localStorage.removeItem("forme.active_opportunity");
    } catch { /* ignore */ }
  };

  const handleSave = (o: Opportunity) => {
    persistStatus({ ...statusMap, [o.id]: "saved" });
  };
  const handleArchive = (o: Opportunity) => {
    if (activeId === o.id) persistActive(null);
    persistStatus({ ...statusMap, [o.id]: "archived" });
  };
  const handleUnarchive = (o: Opportunity) => {
    persistStatus({ ...statusMap, [o.id]: "recommended" });
  };
  const handleMakeActive = (o: Opportunity) => {
    persistActive(o.id);
    const bp = resolveBlueprint(o.kind, o.country);
    const step = currentStep(bp, bp.deriveStatuses({ profile: pending, answers: {}, country: o.country, kind: o.kind }));
    try {
      localStorage.setItem("forme.last_journey", JSON.stringify({
        id: o.id, kind: o.kind, country: o.country, displayName: o.displayName, flag: o.flag, currentTitle: step.title,
      }));
    } catch { /* ignore */ }
  };

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-4rem)] sm:-mx-8" style={{ background: T.card, color: T.text }}>
      <div className="mx-auto max-w-4xl space-y-10 px-6 py-10">
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
            My World
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: T.muted }}>
            Everything you need to continue your international journey.
          </p>
          <div className="mt-6">
            <div className="text-[17px] font-medium" style={{ color: T.text }}>
              Welcome back{firstName ? `, ${firstName}` : ""}.
            </div>
            <div className="text-[14px]" style={{ color: T.muted }}>You're one step closer today.</div>
          </div>
        </motion.header>

        {/* Continue Your Journey */}
        <Section title="Continue Your Journey">
          {active && activeBlueprint && activeStep ? (
            <div
              className="rounded-3xl p-7 sm:p-9"
              style={{
                background: `linear-gradient(180deg, ${T.card} 0%, ${T.surface} 100%)`,
                border: `1px solid ${T.border}`,
                boxShadow: "0 2px 4px rgba(30,30,46,0.04), 0 24px 48px -24px rgba(139,92,246,0.24)",
              }}
            >
              <div className="flex items-center gap-3">
                {active.flag && <span className="text-4xl leading-none" aria-hidden>{active.flag}</span>}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: T.muted }}>
                    {active.country ?? "Your opportunity"}
                  </div>
                  <div className="text-xl font-semibold" style={{ color: T.text }}>
                    {activeBlueprint.displayName}
                  </div>
                </div>
              </div>
              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.primary }}>Current Step</div>
                  <div className="mt-1.5 text-[16px] font-medium leading-snug" style={{ color: T.text }}>
                    {activeStep.title}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.primary }}>Next Action</div>
                  <div className="mt-1.5 text-[15px] leading-snug" style={{ color: T.muted }}>
                    {activeStep.description}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => navigate({ to: "/journey/$id", params: { id: active.id } })}
                size="lg"
                className="mt-7 h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
                style={{ background: T.primary, boxShadow: `0 12px 30px -12px ${T.primary}` }}
              >
                Continue Journey <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <EmptyCard
              text={nonArchived.length > 0
                ? "Pick one of your opportunities below to set it as your Active Journey."
                : "You haven't started a journey yet. Explore your recommended opportunities."}
              cta={nonArchived.length > 0 ? "See my opportunities" : "Explore Opportunities"}
              onCta={() => nonArchived.length > 0
                ? document.querySelector<HTMLElement>("#my-opportunities")?.scrollIntoView({ behavior: "smooth" })
                : navigate({ to: "/results" })}
            />
          )}
        </Section>

        {/* My Opportunities */}
        <Section title="My Opportunities" id="my-opportunities">
          {nonArchived.length === 0 ? (
            <div
              className="rounded-2xl p-6 text-[14px]"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.muted }}
            >
              Opportunities you save will appear here.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {nonArchived.map((o) => {
                const bp = resolveBlueprint(o.kind, o.country);
                const confidence = bp.deriveConfidence({ profile: pending, answers: {}, country: o.country, kind: o.kind });
                return (
                  <div
                    key={o.id}
                    className="flex h-full flex-col rounded-2xl p-6"
                    style={{
                      background: T.card,
                      border: `1px solid ${o.status === "active" ? T.secondary : T.border}`,
                      boxShadow: o.status === "active"
                        ? `0 10px 30px -20px ${T.primary}`
                        : "0 1px 2px rgba(30,30,46,0.04)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {o.flag && <span className="text-2xl leading-none" aria-hidden>{o.flag}</span>}
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: T.muted }}>
                            {o.country ?? KIND_LABEL[o.kind]}
                          </div>
                          <div className="text-[15px] font-semibold" style={{ color: T.text }}>
                            {o.displayName}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: T.muted }}>
                      {shortDescription(o.kind, o.country)}
                    </p>
                    <div className="mt-3">
                      <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: T.primary }}>
                        Why it matches
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed" style={{ color: T.text }}>
                        {buildWhy(pending, o)}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[12px]" style={{ color: T.muted }}>
                      <span className="text-[10px] uppercase tracking-[0.2em]">Current Match</span>
                      <ConfidencePill level={confidence.level} />
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: T.border }}>
                      <div className="flex gap-2">
                        <IconAction label="Save" onClick={() => handleSave(o)} disabled={o.status === "saved"}>
                          <Bookmark className="h-3.5 w-3.5" />
                        </IconAction>
                        <IconAction label="Archive" onClick={() => handleArchive(o)}>
                          <Archive className="h-3.5 w-3.5" />
                        </IconAction>
                        {o.status !== "active" && (
                          <IconAction label="Make Active" onClick={() => handleMakeActive(o)}>
                            <Star className="h-3.5 w-3.5" />
                          </IconAction>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (o.status !== "active") handleMakeActive(o);
                          navigate({ to: "/journey/$id", params: { id: o.id } });
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-white transition-transform hover:-translate-y-0.5"
                        style={{ background: T.primary, boxShadow: `0 8px 20px -10px ${T.primary}` }}
                      >
                        View Journey <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Recommended This Week */}
        {weekly && (
          <></>
        )}
        {archived.length > 0 && (
          <Section title="Archived">
            <div className="grid gap-3 sm:grid-cols-2">
              {archived.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-2xl p-4"
                  style={{ background: T.surface, border: `1px solid ${T.border}` }}
                >
                  <div className="flex items-center gap-3">
                    {o.flag && <span className="text-xl" aria-hidden>{o.flag}</span>}
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: T.muted }}>
                        {o.country ?? KIND_LABEL[o.kind]}
                      </div>
                      <div className="text-[14px] font-medium" style={{ color: T.text }}>
                        {o.displayName}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnarchive(o)}
                    className="text-[12px] font-medium uppercase tracking-[0.18em]"
                    style={{ color: T.primary }}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}
        {weekly && (
          <Section title="Recommended This Week">
            <div
              className="rounded-3xl p-7"
              style={{
                background: `linear-gradient(180deg, ${T.surface} 0%, ${T.card} 100%)`,
                border: `1px solid ${T.secondary}`,
              }}
            >
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
                   style={{ background: T.card, color: T.primary, border: `1px solid ${T.border}` }}>
                <Sparkles className="h-3 w-3" /> New Recommendation
              </div>
              <div className="mt-4 flex items-center gap-3">
                {weekly.flag && <span className="text-3xl leading-none" aria-hidden>{weekly.flag}</span>}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
                    {weekly.country ?? KIND_LABEL[weekly.kind]}
                  </div>
                  <div className="text-lg font-semibold" style={{ color: T.text }}>{weekly.displayName}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.primary }}>Why it matches</div>
                <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: T.text }}>
                  {buildWhy(pending, weekly)}
                </p>
              </div>
              <Button
                onClick={() => navigate({ to: "/journey/$id", params: { id: weekly.id } })}
                variant="ghost"
                className="mt-5 h-11 rounded-full px-5 text-[14px] font-medium hover:bg-transparent"
                style={{ color: T.primary }}
              >
                View Details <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </Section>
        )}

        {/* Upcoming Steps */}
        {active && upcomingSteps.length > 0 && (
          <Section title="Upcoming Steps">
            <div className="rounded-2xl p-6" style={{ background: T.card, border: `1px solid ${T.border}` }}>
              <ol className="space-y-3">
                {upcomingSteps.map((step, i) => {
                  const isNext = step.id === activeStep?.id;
                  return (
                    <li key={step.id} className="flex items-center gap-3">
                      <span
                        className="grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold"
                        style={{
                          background: isNext ? T.primary : T.surface,
                          color: isNext ? "#fff" : T.primary,
                          border: `1px solid ${isNext ? "transparent" : T.border}`,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="text-[15px]"
                        style={{ color: isNext ? T.text : T.muted, fontWeight: isNext ? 600 : 400 }}
                      >
                        {step.title}
                      </span>
                      {isNext && (
                        <span
                          className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em]"
                          style={{ background: T.surface, color: T.primary }}
                        >
                          Next
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </Section>
        )}

        {/* Notifications */}
        <Section title="Notifications">
          <div
            className="divide-y rounded-2xl"
            style={{ background: T.card, border: `1px solid ${T.border}`, borderColor: T.border }}
          >
            {[
              "A new opportunity matches your profile.",
              "A scholarship deadline is approaching.",
              "Your next step is ready.",
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

        {/* Keep ConfidenceCard import used in module — silences unused if not consumed */}
        <div className="hidden"><ConfidenceCard level="High" /></div>
      </div>
    </div>
  );
}

function buildWhy(p: Pending, o: Opportunity): string {
  const bits: string[] = [];
  if (o.country && (p.countries_of_interest ?? []).includes(o.country)) bits.push(`${o.country} is one of your preferred destinations`);
  if (p.qualification) bits.push(`your ${p.qualification} background`);
  const prof = p.profession ?? p.occupation;
  if (prof) bits.push(`your experience as ${prof}`);
  if (p.main_goal) bits.push(`your goal to ${p.main_goal.toLowerCase()}`);
  const tail = bits.length > 0 ? bits.join(", ") : "your current profile";
  return `Based on ${tail}, this pathway is a strong next step to explore.`;
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id}>
      <div className="mb-3 text-[11px] uppercase tracking-[0.28em]" style={{ color: T.muted }}>
        {title}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: OppStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.14em]"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function ConfidencePill({ level }: { level: "High" | "Medium" | "Low" }) {
  const color = level === "High" ? T.success : level === "Medium" ? T.primary : T.warning;
  const bg = level === "High" ? "#E7F8F0" : level === "Medium" ? T.surface : "#FDF3E7";
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: bg, color }}>
      {level}
    </span>
  );
}

function IconAction({
  children, label, onClick, disabled,
}: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full transition disabled:opacity-40"
      style={{ background: T.surface, color: T.primary, border: `1px solid ${T.border}` }}
    >
      {children}
    </button>
  );
}

function EmptyCard({ text, cta, onCta }: { text: string; cta: string; onCta: () => void }) {
  return (
    <div className="rounded-2xl p-6 text-center" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
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