import { AlertTriangle } from "lucide-react";
import { tokens as T } from "./tokens";

export type MistakesListProps = {
  title?: string;
  mistakes: string[];
};

export function MistakesList({ title = "Common Mistakes", mistakes }: MistakesListProps) {
  if (mistakes.length === 0) return null;
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: "0 1px 2px rgba(30,30,46,0.04)",
      }}
    >
      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {mistakes.slice(0, 3).map((m, i) => (
          <li key={i} className="flex items-start gap-2 text-[14px] leading-relaxed" style={{ color: T.text }}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.warning }} />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}