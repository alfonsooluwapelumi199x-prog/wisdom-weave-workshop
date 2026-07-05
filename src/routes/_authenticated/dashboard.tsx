import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Loader2, ExternalLink, MapPin, ArrowRight } from "lucide-react";
import { getMyProfile, generateInsights } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Pelumi" }] }),
  component: Dashboard,
});

type Opportunity = {
  title: string;
  type: string;
  country: string;
  why_fits: string;
  next_steps: string[];
  official_resources: Array<{ label: string; url: string }>;
};

function Dashboard() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const runInsights = useServerFn(generateInsights);
  const [generating, setGenerating] = useState(false);

  const { data: profile, refetch, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
  });

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_complete) {
      navigate({ to: "/onboarding" });
    }
  }, [profile, isLoading, navigate]);

  const generate = async () => {
    setGenerating(true);
    try {
      await runInsights();
      await refetch();
      toast.success("Fresh opportunities generated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (profile?.onboarding_complete && !profile.ai_summary && !generating) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.onboarding_complete]);

  if (isLoading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  const opportunities = (profile.ai_opportunities as unknown as Opportunity[] | null) ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-semibold tracking-tight">{profile.full_name || "there"}</h1>
        </div>
        <Button onClick={generate} disabled={generating} variant="outline">
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {generating ? "Generating…" : "Refresh opportunities"}
        </Button>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/60 p-8"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">
          <Sparkles className="h-3 w-3" /> Profile summary
        </div>
        {generating && !profile.ai_summary ? (
          <p className="text-muted-foreground">Analyzing your profile…</p>
        ) : profile.ai_summary ? (
          <p className="text-lg leading-relaxed text-foreground/90">{profile.ai_summary}</p>
        ) : (
          <p className="text-muted-foreground">Click "Refresh opportunities" to generate your briefing.</p>
        )}
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Chip>{profile.qualification}</Chip>
          <Chip>{profile.occupation}</Chip>
          <Chip>{profile.years_experience} yrs experience</Chip>
          {(profile.countries_of_interest ?? []).map((c: string) => (
            <Chip key={c}><MapPin className="mr-1 inline h-3 w-3" />{c}</Chip>
          ))}
        </div>
      </motion.section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Opportunities worth exploring</h2>
        {opportunities.length === 0 && !generating ? (
          <p className="text-muted-foreground">No opportunities yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {opportunities.map((op, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary">{op.type}</span>
                  <span className="text-muted-foreground">· {op.country}</span>
                </div>
                <h3 className="text-lg font-semibold">{op.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{op.why_fits}</p>

                {op.next_steps?.length ? (
                  <div className="mt-4">
                    <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Next steps</div>
                    <ul className="space-y-1 text-sm">
                      {op.next_steps.map((s, j) => (
                        <li key={j} className="flex gap-2"><ArrowRight className="mt-1 h-3 w-3 shrink-0 text-primary" />{s}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {op.official_resources?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {op.official_resources.map((r, j) => (
                      <a
                        key={j}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs text-foreground/80 hover:border-primary/60 hover:text-primary"
                      >
                        {r.label} <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </motion.article>
            ))}
          </div>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          Educational information only. Verify eligibility on official sources before applying.
        </p>
      </section>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1">{children}</span>;
}