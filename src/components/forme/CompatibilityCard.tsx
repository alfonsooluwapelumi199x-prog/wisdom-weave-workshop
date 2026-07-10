import { Check, AlertTriangle } from "lucide-react";
import { tokens as T } from "./tokens";

export type CompatReason = { ok: boolean; text: string };

export type CompatibilityCardProps = {
  label?: string;
  mode?: "preliminary" | "full";
  score?: number;
  reasons: CompatReason[];
};

export function CompatibilityCard({
  label,
  mode = "preliminary",
  score,
  reasons,
}: CompatibilityCardProps) {
  const resolvedLabel = label ?? (mode === "full" ? "Profile Compatibility" : "Current Profile Fit");
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: "0 1px 2px rgba(30,30,46,0.04), 0 8px 24px -12px rgba(139,92,246,0.10)",
      }}
    >
      <div className="flex items-start gap-5">
        {mode === "full" && typeof score === "number" ? (
          <CircularScore value={score} />
        ) : (
          <div className="flex flex-col items-start">
            <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
              {resolvedLabel}
            </span>
            <span className="mt-1 text-base font-medium" style={{ color: T.primary }}>
              Based on what we know so far
            </span>
          </div>
        )}
        {mode === "full" && (
          <div className="flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
              {resolvedLabel}
            </span>
          </div>
        )}
      </div>
      <ul className="mt-5 space-y-2">
        {reasons.map((r, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[14px] leading-snug"
            style={{ color: r.ok ? T.text : T.muted }}
          >
            {r.ok ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.success }} strokeWidth={3} />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.warning }} />
            )}
            <span>{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CircularScore({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke={T.border} strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={T.primary}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-semibold" style={{ color: T.text }}>
          {clamped}
          <span className="text-xs font-medium" style={{ color: T.muted }}>%</span>
        </span>
      </div>
    </div>
  );
}