import { Compass } from "lucide-react";
import { tokens as T } from "./tokens";

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center rounded-3xl px-8 py-14 text-center"
      style={{ background: T.surface, border: `1px dashed ${T.border}` }}
    >
      <span
        className="inline-flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: T.card, color: T.primary, border: `1px solid ${T.border}` }}
      >
        {icon ?? <Compass className="h-6 w-6" />}
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-tight" style={{ color: T.text }}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: T.muted }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          style={{ background: T.primary, boxShadow: `0 8px 20px -10px ${T.primary}` }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}