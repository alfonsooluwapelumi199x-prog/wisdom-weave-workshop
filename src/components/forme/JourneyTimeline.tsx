import { Check, Lock } from "lucide-react";
import { tokens as T } from "./tokens";

export type TimelineStatus = "completed" | "in_progress" | "not_started" | "locked";

export type TimelineStep = {
  n: number;
  title: string;
  description?: string;
  status: TimelineStatus;
};

export type JourneyTimelineProps = {
  steps: TimelineStep[];
};

export function JourneyTimeline({ steps }: JourneyTimelineProps) {
  return (
    <ol className="relative space-y-6">
      {steps.map((s, i) => {
        const active = s.status === "in_progress";
        const complete = s.status === "completed";
        const locked = s.status === "locked";
        const bg = complete ? T.success : active ? T.primary : "transparent";
        const border = complete || active ? "none" : `1.5px solid ${T.secondary}`;
        const color = complete || active ? "#fff" : T.muted;
        return (
          <li key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: bg, border, color }}
              >
                {complete ? <Check className="h-4 w-4" strokeWidth={3} /> : locked ? <Lock className="h-3.5 w-3.5" /> : s.n}
              </span>
              {i < steps.length - 1 && (
                <span
                  className="mt-1 w-px flex-1"
                  style={{ background: T.border, minHeight: 24 }}
                />
              )}
            </div>
            <div
              className="flex-1 rounded-2xl p-5 transition-all"
              style={{
                background: active ? T.surface : T.card,
                border: `1px solid ${active ? T.secondary : T.border}`,
                opacity: locked ? 0.55 : 1,
                boxShadow: active ? `0 10px 30px -20px ${T.primary}` : "none",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[15px] font-medium" style={{ color: T.text }}>
                  {s.title}
                </div>
                <StatusChip status={s.status} />
              </div>
              {s.description && (
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: T.muted }}>
                  {s.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StatusChip({ status }: { status: TimelineStatus }) {
  const map = {
    completed: { label: "Completed", bg: "#E7F8F0", color: T.success },
    in_progress: { label: "In progress", bg: T.surface, color: T.primary },
    not_started: { label: "Not started", bg: "#F3F0FA", color: T.muted },
    locked: { label: "Locked", bg: "#F3F0FA", color: T.muted },
  } as const;
  const s = map[status];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em]"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}