import { tokens as T } from "./tokens";

export type CountryHeaderProps = {
  flag?: string;
  countryName?: string;
  opportunityName: string;
  eyebrow?: string;
};

export function CountryHeader({ flag, countryName, opportunityName, eyebrow }: CountryHeaderProps) {
  return (
    <header className="flex flex-col items-center text-center">
      {flag && (
        <span className="text-5xl leading-none" aria-hidden>
          {flag}
        </span>
      )}
      {eyebrow && (
        <span className="mt-3 text-[11px] uppercase tracking-[0.28em]" style={{ color: T.muted }}>
          {eyebrow}
        </span>
      )}
      {countryName && (
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: T.text }}>
          {countryName}
        </h1>
      )}
      <p className="mt-1 text-lg sm:text-xl" style={{ color: T.muted }}>
        {opportunityName}
      </p>
    </header>
  );
}