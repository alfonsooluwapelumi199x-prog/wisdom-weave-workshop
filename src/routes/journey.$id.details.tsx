import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  tokens as T,
  CountryHeader,
  WhyFitsCard,
  OfficialResourceCard,
  MistakesList,
} from "@/components/forme";
import {
  parseJourneyId,
  resolveBlueprint,
  COUNTRY_FLAG,
  type Kind,
  type Pending,
} from "@/lib/opportunity-plans";

export const Route = createFileRoute("/journey/$id/details")({
  head: () => ({ meta: [{ title: "Opportunity Details · ForMe" }] }),
  component: DetailsPage,
});

type Details = {
  what: string;
  who: string;
  how: string;
  benefits: string[];
  eligibility: string[];
  timeline: string;
  cost: string;
  documents: string[];
  language: string;
  education: string;
  workExperience: string;
  stages: string[];
  resources: { name: string; url: string; description: string }[];
  mistakes: string[];
  systemExplainer?: string;
};

function buildDetails(kind: Kind, country?: string): Details {
  const c = country ?? "your destination";
  const generic: Details = {
    what: `An international pathway that can help candidates like you build a life, career or education in ${c}.`,
    who: `Designed for professionals, students and applicants outside ${c} who meet the destination's eligibility framework.`,
    how: `Applications are usually made through the country's official immigration or education authority. Your profile is reviewed against published criteria, and successful applicants are invited to apply for the relevant visa, admission or programme.`,
    benefits: [
      "A legally recognised route into the destination",
      "Clear published requirements you can prepare for",
      "Access to work, study or long-term residence, depending on the pathway",
    ],
    eligibility: [
      "A valid passport",
      "Meeting the destination's education or work-experience thresholds",
      "Language proficiency where required",
      "Sufficient funds or sponsorship, depending on the route",
    ],
    timeline: "Typical preparation and processing takes 3–12 months.",
    cost: "Government fees, tests and document preparation typically range from $500 to $5,000+ depending on the route.",
    documents: [
      "Passport",
      "Educational transcripts and certificates",
      "Proof of work experience (where relevant)",
      "Language test results (where required)",
      "Proof of funds (where required)",
    ],
    language: "Most pathways require an approved English test result (IELTS, TOEFL, PTE or equivalent). Some destinations accept or require additional languages.",
    education: "Post-secondary education is usually required. Some routes require credential recognition or an equivalency assessment.",
    workExperience: "Skilled routes typically favour 1+ years of relevant, documented work experience. Study routes may not require it.",
    stages: [
      "Confirm eligibility and gather documents",
      "Complete any required tests or assessments",
      "Submit your profile or application through official channels",
      "Respond to requests for information",
      "Receive an official decision",
    ],
    resources: [],
    mistakes: [
      "Assuming that meeting minimum criteria guarantees selection",
      "Missing document validity or translation requirements",
      "Underestimating processing time when planning a move",
    ],
  };

  if (kind === "pr" && country === "Canada") {
    return {
      ...generic,
      what: "Express Entry is Canada's flagship application-management system for skilled workers seeking permanent residence. Eligible profiles are placed in a pool and ranked; the highest-scoring candidates are invited to apply for PR.",
      who: "Designed for skilled workers outside Canada (and some inside Canada) who have a post-secondary qualification, work experience in a recognised occupation, and language proficiency in English or French.",
      how: "You create a profile that estimates your Comprehensive Ranking System (CRS) score based on age, education, language, and work experience. Profiles enter a pool and IRCC runs regular draws; candidates above the draw's cut-off receive an Invitation to Apply (ITA). ITA holders then submit a complete PR application to IRCC.",
      systemExplainer:
        "The Comprehensive Ranking System (CRS) awards points across core human capital, spouse factors, skill transferability and additional factors such as a provincial nomination or a valid job offer. Draw scores, category-based rounds, and eligibility rules change over time, so ForMe provides guidance rather than an official IRCC decision.",
      benefits: [
        "A direct route to Canadian permanent residence",
        "Processing target of six months for most complete applications",
        "Includes your spouse and dependent children",
        "Pathway to Canadian citizenship after meeting residency requirements",
      ],
      eligibility: [
        "At least 1 year of continuous, full-time (or equivalent) skilled work experience in an eligible NOC TEER category",
        "Post-secondary education, assessed by an ECA against Canadian standards",
        "Minimum language proficiency (typically CLB 7 in all four abilities for FSW)",
        "Sufficient settlement funds unless you have a valid job offer or are already working in Canada",
      ],
      timeline: "ECA: 6–12 weeks. Language test booking to results: 2–6 weeks. Profile in pool: variable — draws happen roughly every 2 weeks. PR application after ITA: usually 6 months.",
      cost: "Approximate: ECA CAD $200–$300, language test £180–£250, application and right-of-PR fees CAD $1,365 per adult, biometrics CAD $85 per person, medicals CAD $200–$400 per person.",
      documents: [
        "Valid passport",
        "ECA report (WES, IQAS, ICAS or approved body)",
        "Approved language test results (IELTS General / CELPIP / PTE Core / TEF / TCF)",
        "Reference letters detailing NOC-aligned duties",
        "Proof of settlement funds",
        "Police certificates and medical exam (after ITA)",
      ],
      language: "IELTS General Training, CELPIP General or PTE Core for English. TEF Canada or TCF Canada for French. French proficiency significantly boosts your CRS.",
      education: "Foreign qualifications require an Educational Credential Assessment (ECA) to be recognised against Canadian standards.",
      workExperience: "Continuous, paid, skilled experience in NOC TEER 0, 1, 2 or 3 occupations. Duties in your reference letters must clearly match the NOC lead statement.",
      stages: [
        "Language test and ECA",
        "Create Express Entry profile in the IRCC portal",
        "Enter the pool with a calculated CRS score",
        "Await an Invitation to Apply (ITA) in a general or category-based draw",
        "Submit a complete PR application within 60 days",
        "Provide biometrics, medicals and police checks",
        "Receive a decision from IRCC (COPR)",
      ],
      resources: [
        { name: "IRCC — Express Entry", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html", description: "Official Government of Canada page for Express Entry." },
        { name: "IRCC CRS Tool", url: "https://www.cic.gc.ca/english/immigrate/skilled/crs-tool.asp", description: "Estimate your Comprehensive Ranking System score." },
        { name: "WES Canada (ECA)", url: "https://www.wes.org/ca", description: "Most common ECA provider for Express Entry." },
      ],
      mistakes: [
        "Submitting reference letters that don't clearly describe NOC-aligned duties",
        "Choosing the wrong test type (IELTS Academic instead of General Training)",
        "Assuming a CRS above the last draw cut-off guarantees a future ITA — scores and rules change",
      ],
    };
  }

  if (kind === "scholarship") {
    return {
      ...generic,
      what: `Merit- and need-based funding to study in ${c}. Programmes vary from full tuition + stipend to partial top-ups.`,
      who: `Students with strong academic records applying to eligible programmes. Some scholarships target specific nationalities, fields or career goals.`,
      how: "You typically apply either directly to the scholarship body or through the host university. Applications include transcripts, references, a statement of purpose and sometimes a research proposal or interview.",
      benefits: ["Tuition support", "Living stipend (for full awards)", "Access to elite programmes and alumni networks"],
      eligibility: [
        "Strong academic record (upper-second / first-class or equivalent typically)",
        "Admission or intent to study an eligible programme",
        "Language proficiency for the host institution",
        "Nationality or country-of-origin criteria for many awards",
      ],
      timeline: "Scholarship cycles run 6–12 months ahead of intake. Plan applications 9–18 months before your intended start.",
      cost: "Application costs are usually low, but you may fund transcripts, tests and admission application fees.",
      documents: ["Transcripts", "Statement of purpose or motivation letter", "References", "Language test results", "CV / resume"],
      language: "Almost always requires an approved English test unless studying in a native-language country.",
      education: "Match programme prerequisites — some awards are for masters, some for PhDs, some for undergraduates.",
      workExperience: "Optional for most academic awards. Certain fellowships (e.g. Chevening) look for leadership and work experience.",
      stages: [
        "Confirm eligibility and shortlist scholarships",
        "Secure or plan admission to an eligible programme",
        "Prepare statement, references and documents",
        "Submit before the deadline",
        "Interviews or additional assessment (some awards)",
        "Receive award decision",
      ],
      mistakes: [
        "Missing deadlines by weeks or days",
        "Recycling the same statement for every scholarship",
        "Ignoring the scholarship's explicit selection criteria",
      ],
    };
  }

  if (kind === "study") {
    return {
      ...generic,
      what: `A pathway to enrol at an accredited institution in ${c}, with the right to study and (often) work part-time.`,
      how: "You apply to universities directly or via a centralised platform. Once admitted, you apply for a student visa/permit at the destination's consulate or online portal.",
    };
  }

  if (kind === "work") {
    return {
      ...generic,
      what: `A route to work legally in ${c}, typically through employer sponsorship or a skilled-worker programme.`,
      how: "You usually need a job offer from an approved employer. The employer or you then apply for the corresponding work permit or visa.",
      workExperience: "Most sponsored routes require 1+ years of directly relevant experience and a role that meets the destination's skill threshold.",
    };
  }

  return generic;
}

function DetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { kind, country } = parseJourneyId(id);
  const blueprint = resolveBlueprint(kind, country);
  const details = useMemo(() => buildDetails(kind, country), [kind, country]);
  const flag = country ? COUNTRY_FLAG[country] : undefined;

  const [pending, setPending] = useState<Pending>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("forme.pending_profile");
      if (raw) setPending(JSON.parse(raw));
    } catch { /* ignore */ }
    // Persist selected opportunity so downstream pages preserve it
    try {
      localStorage.setItem(
        "forme.last_journey",
        JSON.stringify({ id, kind, country, displayName: blueprint.displayName, flag }),
      );
    } catch { /* ignore */ }
  }, [id, kind, country, blueprint.displayName, flag]);

  const whyMatch: string[] = [];
  if (pending.main_goal) whyMatch.push(`Your stated goal is ${pending.main_goal}.`);
  if (pending.qualification) whyMatch.push(`Your highest qualification (${pending.qualification}) fits typical entry criteria.`);
  const prof = pending.profession ?? pending.occupation;
  if (prof) whyMatch.push(`Your profession (${prof}) is relevant to this pathway.`);
  if (country && (pending.countries_of_interest ?? []).includes(country)) whyMatch.push(`${country} is one of your preferred destinations.`);
  if (pending.country_of_residence) whyMatch.push(`Your current country of residence (${pending.country_of_residence}) has been considered.`);
  if (pending.nationality) whyMatch.push(`Your nationality (${pending.nationality}) is relevant where legally required.`);

  const missing = [
    "Exact years of work experience",
    "Job duties or occupation classification",
    "Language test status and scores",
    "Academic grades",
    "Credential assessment status",
    "Professional licensing status",
    "Passport validity",
    "Available budget or proof of funds",
    "Intended start date",
    "Marital status and dependants (where relevant)",
    "Previous applications, refusals or international experience",
  ];

  const resources = details.resources.length
    ? details.resources
    : (blueprint.steps.flatMap((s) => s.resources ?? []).map((r) => ({ name: r.name, url: r.url, description: r.description })));

  return (
    <div className="min-h-screen" style={{ background: T.card, color: T.text }}>
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <Link to="/results" className="inline-flex items-center gap-1.5 text-sm" style={{ color: T.muted }}>
          <ArrowLeft className="h-4 w-4" /> Back to opportunities
        </Link>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-6 pb-24 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <CountryHeader
            flag={flag}
            countryName={country}
            opportunityName={blueprint.displayName}
            eyebrow="Opportunity Details"
          />
        </motion.div>

        {/* Preliminary match banner */}
        <div
          className="rounded-2xl p-5"
          style={{ background: T.surface, border: `1px dashed ${T.secondary}` }}
        >
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4" style={{ color: T.primary }} />
            <p className="text-[14px] leading-relaxed" style={{ color: T.text }}>
              This is an <strong>initial opportunity match</strong> based on the limited profile you've shared so far.
              It is not a confirmed eligibility decision. Completing your journey profile will let ForMe assess this
              opportunity more accurately.
            </p>
          </div>
        </div>

        {/* What / Who / How */}
        <Card title="What this opportunity is">{details.what}</Card>
        <Card title="Who it's designed for">{details.who}</Card>
        <Card title="How the pathway works">{details.how}</Card>

        {details.systemExplainer && (
          <Card title="How the ranking / invitation system works">{details.systemExplainer}</Card>
        )}

        {/* Benefits + Eligibility */}
        <div className="grid gap-4 sm:grid-cols-2">
          <BulletCard title="Main benefits" items={details.benefits} tone="success" />
          <BulletCard title="Main eligibility requirements" items={details.eligibility} />
        </div>

        {/* Timeline + Cost */}
        <div className="grid gap-4 sm:grid-cols-2">
          <MetaCard label="Estimated Timeline" value={details.timeline} />
          <MetaCard label="Estimated Cost" value={details.cost} />
        </div>

        {/* Requirements grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Language requirements">{details.language}</Card>
          <Card title="Education requirements">{details.education}</Card>
          <Card title="Work-experience requirements">{details.workExperience}</Card>
          <BulletCard title="Required documents" items={details.documents} />
        </div>

        {/* Stages */}
        <div>
          <SectionLabel>Official application stages</SectionLabel>
          <ol className="mt-4 space-y-2.5">
            {details.stages.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl p-4"
                style={{ background: T.card, border: `1px solid ${T.border}` }}
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
                  style={{ background: T.surface, color: T.primary }}
                >
                  {i + 1}
                </span>
                <span className="text-[14.5px] leading-relaxed" style={{ color: T.text }}>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Why ForMe recommended */}
        <WhyFitsCard points={whyMatch.length > 0 ? whyMatch : ["Based on the limited profile information you've shared so far."]} />

        {/* Your Current Match */}
        <div
          className="rounded-3xl p-7 sm:p-8"
          style={{ background: `linear-gradient(180deg, ${T.card} 0%, ${T.surface} 100%)`, border: `1px solid ${T.border}` }}
        >
          <div className="text-[11px] uppercase tracking-[0.28em]" style={{ color: T.primary }}>
            Your Current Match
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight" style={{ color: T.text }}>
            An initial match — not yet a confirmed eligibility decision.
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: T.muted }}>
            We identified this as a potentially strong opportunity using the information you have already shared. However,
            your current profile does not yet contain all the details required to confirm eligibility, assess how competitive
            you may be, or fully personalise your journey.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>Known from your profile</div>
              <ul className="mt-3 space-y-1.5 text-[14px]" style={{ color: T.text }}>
                {whyMatch.length > 0 ? whyMatch.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.success }} />
                    <span>{w}</span>
                  </li>
                )) : <li style={{ color: T.muted }}>Only limited discovery details captured so far.</li>}
              </ul>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>Still needed</div>
              <ul className="mt-3 space-y-1.5 text-[14px]" style={{ color: T.text }}>
                {missing.slice(0, 6).map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.warning }} />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 rounded-2xl p-4 text-[13.5px] leading-relaxed" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.muted }}>
            You will <strong>not</strong> need to answer your original profile questions again. We only ask what we don't yet know.
          </p>

          <Button
            onClick={() => navigate({ to: "/journey/$id", params: { id } })}
            size="lg"
            className="mt-6 h-12 rounded-full border-0 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{ background: T.primary, boxShadow: `0 12px 30px -12px ${T.primary}` }}
          >
            View My Opportunity Plan <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>

        {/* Resources */}
        {resources.length > 0 && (
          <div>
            <SectionLabel>Official sources & resources</SectionLabel>
            <div className="mt-4 space-y-3">
              {resources.map((r) => (
                <OfficialResourceCard key={r.name} name={r.name} description={r.description} url={r.url} />
              ))}
            </div>
          </div>
        )}

        {/* Common mistakes */}
        {details.mistakes.length > 0 && <MistakesList mistakes={details.mistakes} />}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 1px 2px rgba(30,30,46,0.04)" }}>
      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>{title}</div>
      <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: T.text }}>{children}</p>
    </div>
  );
}

function BulletCard({ title, items, tone }: { title: string; items: string[]; tone?: "success" }) {
  const iconColor = tone === "success" ? T.success : T.primary;
  return (
    <div className="rounded-2xl p-6" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 1px 2px rgba(30,30,46,0.04)" }}>
      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>{title}</div>
      <ul className="mt-3 space-y-2 text-[14px]" style={{ color: T.text }}>
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: iconColor }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 1px 2px rgba(30,30,46,0.04)" }}>
      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: T.muted }}>{label}</div>
      <div className="mt-2 text-[15px] leading-snug" style={{ color: T.text }}>{value}</div>
    </div>
  );
}