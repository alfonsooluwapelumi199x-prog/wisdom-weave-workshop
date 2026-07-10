import { Check } from "lucide-react";
import { tokens as T } from "./tokens";

export type WhyFitsCardProps = {
  title?: string;
  points: string[];
};

export function WhyFitsCard({ title = "Why this was recommended", points }: WhyFitsCardProps) {
  if (points.length === 0) return null;
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
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-[15px] leading-relaxed" style={{ color: T.text }}>
            <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: T.success }} strokeWidth={3} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}