import { tokens as T } from "./tokens";

export type ConfidenceLevel = "High" | "Medium" | "Low";

export type ConfidenceCardProps = {
  level: ConfidenceLevel;
  note?: string;
};

export function ConfidenceCard({ level, note }: ConfidenceCardProps) {
  const color = level === "High" ? T.success : level === "Medium" ? T.primary : T.warning;
  const bg = level === "High" ? "#E7F8F0" : level === "Medium" ? T.surface : "#FDF3E7";
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: "0 1px 2px rgba(30,30,46,0.04), 0 8px 24px -12px rgba(139,92,246,0.08)",
      }}
    >
      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
        Opportunity Confidence
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
          style={{ background: bg, color }}
        >
          {level}
        </span>
        <span className="text-sm" style={{ color: T.muted }}>
          Based on the information you've shared so far.
        </span>
      </div>
      {note && (
        <p className="mt-3 text-sm leading-relaxed" style={{ color: T.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}