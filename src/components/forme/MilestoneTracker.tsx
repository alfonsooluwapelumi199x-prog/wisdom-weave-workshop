import { Check } from "lucide-react";
import { tokens as T } from "./tokens";

export type Milestone = { label: string; done: boolean };

export type MilestoneTrackerProps = {
  milestones: Milestone[];
  title?: string;
};

export function MilestoneTracker({ milestones, title = "Milestones" }: MilestoneTrackerProps) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
        {title}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {milestones.map((m) => (
          <span
            key={m.label}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px]"
            style={{
              background: m.done ? "#E7F8F0" : T.card,
              color: m.done ? T.success : T.muted,
              border: `1px solid ${m.done ? "transparent" : T.border}`,
              fontWeight: m.done ? 500 : 400,
            }}
          >
            {m.done ? (
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            ) : (
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ border: `1.5px solid ${T.secondary}` }}
              />
            )}
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}