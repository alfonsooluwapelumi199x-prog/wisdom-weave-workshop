import { ExternalLink } from "lucide-react";
import { tokens as T } from "./tokens";

export type ResourceCardProps = {
  title: string;
  description: string;
  href: string;
};

export function ResourceCard({ title, description, href }: ResourceCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start justify-between gap-3 rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: "0 1px 2px rgba(30,30,46,0.04)",
      }}
    >
      <div>
        <div className="text-[15px] font-medium" style={{ color: T.text }}>
          {title}
        </div>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: T.muted }}>
          {description}
        </p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0" style={{ color: T.primary }} />
    </a>
  );
}