import { ExternalLink, ShieldCheck } from "lucide-react";
import { tokens as T } from "./tokens";

export type OfficialResourceCardProps = {
  name: string;
  description: string;
  url: string;
};

export function OfficialResourceCard({ name, description, url }: OfficialResourceCardProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: "0 1px 2px rgba(30,30,46,0.04)",
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold" style={{ color: T.text }}>
            {name}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: T.surface, color: T.primary }}
          >
            <ShieldCheck className="h-3 w-3" /> Official
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: T.muted }}>
          {description}
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
        style={{ background: T.primary, boxShadow: `0 8px 20px -10px ${T.primary}` }}
      >
        Open Official Website <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}