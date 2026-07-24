import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useServerFn } from "@tanstack/react-start";
import { saveOnboarding } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Let's save your journey · ForMe" },
      {
        name: "description",
        content:
          "Create your free ForMe account to save your personalised opportunities and continue where you left off.",
      },
    ],
  }),
  component: AuthPage,
});

const PENDING_KEY = "forme.pending_profile";

async function persistPending(save: (args: { data: unknown }) => Promise<unknown>) {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(PENDING_KEY) : null;
    if (!raw) return;
    const data = JSON.parse(raw);
    await save({ data });
    localStorage.removeItem(PENDING_KEY);
  } catch (err) {
    console.error("Failed to persist pending profile", err);
  }
}

function AuthPage() {
  const navigate = useNavigate();
  const save = useServerFn(saveOnboarding);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const finish = async () => {
    await persistPending(save as unknown as (args: { data: unknown }) => Promise<unknown>);
    navigate({ to: "/dashboard" });
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    await finish();
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    toast.success("Account created — welcome!");
    await finish();
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) return toast.error(res.error.message);
    if (res.redirected) return;
    await finish();
  };

  const apple = async () => {
    const res = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (res.error) return toast.error(res.error.message);
    if (res.redirected) return;
    await finish();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--violet),transparent_55%)] opacity-25" />
        <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--violet)] opacity-15 blur-[160px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-foreground/60">
          <Sparkles className="h-3 w-3 text-lilac" />
          Almost there
        </div>
        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Let's save your journey.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-foreground/65">
          We already know enough to discover opportunities for you. Create your free account so we can save your journey, track your progress and personalise your next steps.
        </p>

        <div className="mt-8 space-y-3">
          <Button
            variant="outline"
            className="h-12 w-full rounded-full border-white/15 bg-white/[0.04] text-base hover:bg-white/[0.08]"
            onClick={google}
          >
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-full border-white/15 bg-white/[0.04] text-base hover:bg-white/[0.08]"
            onClick={apple}
          >
            Continue with Apple
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-full border-white/15 bg-white/[0.04] text-base hover:bg-white/[0.08]"
            onClick={() => setShowEmail((v) => !v)}
          >
            Continue with Email
          </Button>
        </div>

        {showEmail && (
        <>
        <div className="my-6 flex items-center gap-3 text-xs text-foreground/40">
          <div className="h-px flex-1 bg-white/10" />or<div className="h-px flex-1 bg-white/10" />
        </div>

        <Tabs defaultValue="signup">
          <TabsList className="grid w-full grid-cols-2 bg-white/[0.04]">
            <TabsTrigger value="signup">Create account</TabsTrigger>
            <TabsTrigger value="signin">Sign in</TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <form onSubmit={signUp} className="mt-6 space-y-4">
              <Field label="Full name">
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-xl border-white/10 bg-white/[0.04]" />
              </Field>
              <Field label="Email">
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl border-white/10 bg-white/[0.04]" />
              </Field>
              <Field label="Password">
                <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl border-white/10 bg-white/[0.04]" />
              </Field>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-full border-0 text-base font-medium text-white"
                style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-premium)" }}
              >
                {loading ? "Creating…" : "Save my journey"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signin">
            <form onSubmit={signIn} className="mt-6 space-y-4">
              <Field label="Email">
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl border-white/10 bg-white/[0.04]" />
              </Field>
              <Field label="Password">
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl border-white/10 bg-white/[0.04]" />
              </Field>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-full border-0 text-base font-medium text-white"
                style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-premium)" }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        </>
        )}
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-[0.18em] text-foreground/55">{label}</Label>
      {children}
    </div>
  );
}
