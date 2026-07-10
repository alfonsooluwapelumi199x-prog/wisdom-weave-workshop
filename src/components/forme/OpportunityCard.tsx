import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { tokens as T } from "./tokens";

export type OpportunityFit = {
  label?: string;
  reasons: string[];
};

export type OpportunityCardProps = {
  country?: string;
  flag?: string;
  opportunityType: string;
  title: string;
  tagline?: string;
  fit: OpportunityFit;
  nextAction?: string;
  ctaLabel?: string;
  onView: () => void;
  index?: number;
};

export function OpportunityCard({
  flag,
  opportunityType,
  title,
  tagline,
  fit,
  nextAction = "View Journey",
  ctaLabel = "View",
  onView,
  index = 0,
}: OpportunityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 * index, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex h-full flex-col rounded-2xl p-6"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: "0 1px 2px rgba(30,30,46,0.04), 0 8px 24px -12px rgba(139,92,246,0.10)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {flag && <span className="text-2xl leading-none" aria-hidden>{flag}</span>}
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: T.muted }}>
              {opportunityType}
            </div>
            <div className="text-base font-semibold" style={{ color: T.text }}>
              {title}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: T.muted }}>
            {fit.label ?? "Current Fit"}
          </div>
          <div className="text-sm font-medium" style={{ color: T.primary }}>
            Based on your profile
          </div>
        </div>
      </div>

      {tagline && (
        <p className="mt-5 text-sm leading-relaxed" style={{ color: T.muted }}>
          {tagline}
        </p>
      )}

      <ul className="mt-4 space-y-1.5">
        {fit.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: T.text }}>
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: T.success }} strokeWidth={3} />
            <span>{r}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t pt-4" style={{ borderColor: T.border }}>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: T.muted }}>
            Next Action
          </div>
          <div className="text-sm font-medium" style={{ color: T.text }}>{nextAction}</div>
        </div>
        <button
          onClick={onView}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          style={{ background: T.primary, boxShadow: `0 8px 20px -10px ${T.primary}` }}
        >
          {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}