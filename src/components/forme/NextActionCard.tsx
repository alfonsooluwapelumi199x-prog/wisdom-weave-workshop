import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tokens as T } from "./tokens";

export type NextActionCardProps = {
  title: string;
  description?: string;
  ctaLabel: string;
  onCta: () => void;
  eyebrow?: string;
};

export function NextActionCard({
  title,
  description,
  ctaLabel,
  onCta,
  eyebrow = "Next action",
}: NextActionCardProps) {
  return (
    <div
      className="rounded-3xl p-8 sm:p-10"
      style={{
        background: `linear-gradient(180deg, ${T.card} 0%, ${T.surface} 100%)`,
        border: `1px solid ${T.border}`,
        boxShadow: "0 2px 4px rgba(30,30,46,0.04), 0 20px 40px -20px rgba(139,92,246,0.20)",
      }}
    >
      <div className="text-[11px] uppercase tracking-[0.28em]" style={{ color: T.primary }}>
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl" style={{ color: T.text }}>
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: T.muted }}>
          {description}
        </p>
      )}
      <Button
        onClick={onCta}
        size="lg"
        className="mt-7 h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
        style={{ background: T.primary, boxShadow: `0 12px 30px -12px ${T.primary}` }}
      >
        {ctaLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}