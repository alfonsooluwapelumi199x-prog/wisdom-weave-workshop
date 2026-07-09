import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Compass, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-background/60 px-5 py-3 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--violet)]/20 text-lilac">
            <Compass className="h-4 w-4" />
          </span>
          ForMe
        </Link>
        <Button size="sm" variant="ghost" onClick={signOut} className="text-foreground/60 hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <main>
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">{children}</div>
      </main>
    </div>
  );
}