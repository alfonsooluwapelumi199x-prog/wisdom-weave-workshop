import { ArrowRight, Sparkles } from "lucide-react";
import { tokens as T } from "./tokens";

export type ImproveRecommendationCardProps = {
  onImprove?: () => void;
  ctaLabel?: string;
};

export function ImproveRecommendationCard({
  onImprove,
  ctaLabel = "Complete My Profile",
}: ImproveRecommendationCardProps) {
  return (
    <div
      className="flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
      style={{
        background: T.surface,
        border: `1px dashed ${T.secondary}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: T.card, color: T.primary, border: `1px solid ${T.border}` }}
        >
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[15px] font-semibold" style={{ color: T.text }}>
            Improve Your Recommendation
          </div>
          <p className="mt-1 max-w-lg text-sm leading-relaxed" style={{ color: T.muted }}>
            Complete your profile to receive a more accurate compatibility assessment and personalised action plan.
          </p>
        </div>
      </div>
      {onImprove && (
        <button
          onClick={onImprove}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          style={{ background: T.primary, boxShadow: `0 8px 20px -10px ${T.primary}` }}
        >
          {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}