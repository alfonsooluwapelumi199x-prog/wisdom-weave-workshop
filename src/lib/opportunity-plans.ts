export type Kind = "pr" | "work" | "study" | "scholarship";

export type Question = {
  id: string;
  prompt: string;
  helper?: string;
  why?: string;
  options: { value: string; label: string }[];
};

export type Resource = {
  name: string;
  description: string;
  url: string;
  official: true;
};

export type StepStatus = "completed" | "in_progress" | "not_started" | "locked";

export type PlanStep = {
  id: string;
  title: string;
  description: string;
  estimatedTime?: string;
  estimatedCost?: string;
  resources?: Resource[];
  mistakes?: string[];
  whatsNext?: string;
};

export type Pending = {
  country_of_residence?: string;
  nationality?: string;
  qualification?: string;
  profession?: string;
  occupation?: string;
  main_goal?: string;
  countries_of_interest?: string[];
};

export type PlanContext = {
  profile: Pending;
  answers: Record<string, string>;
  country?: string;
  kind: Kind;
};

export type OpportunityBlueprint = {
  key: string;
  kind: Kind;
  country?: string;
  displayName: string;
  questions: Question[];
  steps: PlanStep[];
  deriveStatuses: (ctx: PlanContext) => Record<string, StepStatus>;
  deriveConfidence: (ctx: PlanContext) => { level: "High" | "Medium" | "Low"; note?: string };
  buildReasons: (ctx: PlanContext) => string[];
};

const KIND_LABEL: Record<Kind, string> = {
  pr: "Permanent Residence",
  work: "Work",
  study: "Study",
  scholarship: "Scholarship",
};

function baseReasons(ctx: PlanContext): string[] {
  const p = ctx.profile;
  const out: string[] = [];
  if (p.main_goal) out.push(`Your selected goal is ${p.main_goal}.`);
  if (p.qualification) out.push(`Your education (${p.qualification}) aligns with this opportunity.`);
  const prof = p.profession ?? p.occupation;
  if (prof) out.push(`Your profession (${prof}) may align with this pathway.`);
  if (ctx.country && (p.countries_of_interest ?? []).includes(ctx.country))
    out.push(`${ctx.country} is one of your preferred destinations.`);
  return out;
}

function fillStatuses(steps: PlanStep[], currentId: string, completedIds: string[] = []): Record<string, StepStatus> {
  const out: Record<string, StepStatus> = {};
  let seenCurrent = false;
  for (const s of steps) {
    if (completedIds.includes(s.id)) {
      out[s.id] = "completed";
      continue;
    }
    if (s.id === currentId) {
      out[s.id] = "in_progress";
      seenCurrent = true;
      continue;
    }
    out[s.id] = seenCurrent ? "locked" : "not_started";
  }
  return out;
}

function autoWhatsNext(steps: PlanStep[]): PlanStep[] {
  return steps.map((s, i) => {
    if (s.whatsNext) return s;
    const next = steps[i + 1];
    if (!next) return { ...s, whatsNext: "This is the final step in this pathway." };
    return { ...s, whatsNext: `After completing ${s.title.toLowerCase()}, your next step will be ${next.title}.` };
  });
}

/* ---------------- Canada PR (Express Entry) ---------------- */

const CANADA_PR: OpportunityBlueprint = {
  key: "pr:Canada",
  kind: "pr",
  country: "Canada",
  displayName: "Express Entry",
  questions: [
    {
      id: "english_test",
      prompt: "Have you completed an approved English language test?",
      helper: "IELTS General, CELPIP General, or PTE Core.",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "planning", label: "Planning to" },
      ],
    },
    {
      id: "experience",
      prompt: "How many years of relevant work experience do you have?",
      options: [
        { value: "<1", label: "Less than 1 year" },
        { value: "1-2", label: "1–2 years" },
        { value: "3-5", label: "3–5 years" },
        { value: "5+", label: "5+ years" },
      ],
    },
    {
      id: "eca",
      prompt: "Have you completed an Educational Credential Assessment (ECA)?",
      helper: "Required to have foreign education recognised.",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "unsure", label: "Not sure" },
      ],
    },
  ],
  steps: autoWhatsNext([
    {
      id: "profile",
      title: "Confirm your profile details",
      description: "Make sure your education and profession are up to date.",
      estimatedTime: "About 15 minutes",
    },
    {
      id: "english_test",
      title: "English language test",
      description: "Book and complete an approved English test (IELTS General, CELPIP or PTE Core).",
      estimatedTime: "2–6 weeks",
      estimatedCost: "£180–£250",
      resources: [
        { name: "IELTS Official", description: "Official IELTS test booking.", url: "https://www.ielts.org", official: true },
        { name: "CELPIP Official", description: "CELPIP General test — accepted by IRCC.", url: "https://www.celpip.ca", official: true },
        { name: "PTE Core", description: "Pearson PTE Core — accepted by IRCC.", url: "https://www.pearsonpte.com/pte-core", official: true },
      ],
      mistakes: [
        "Booking the academic version instead of General/Core.",
        "Not checking test validity dates before applying.",
        "Using an unlisted or unofficial test provider.",
      ],
    },
    {
      id: "eca",
      title: "Educational Credential Assessment",
      description: "Have your foreign qualification assessed against Canadian standards.",
      estimatedTime: "6–12 weeks",
      estimatedCost: "CAD $200–$300",
      resources: [
        { name: "WES", description: "World Education Services — most common ECA provider.", url: "https://www.wes.org/ca", official: true },
        { name: "IQAS", description: "International Qualifications Assessment Service.", url: "https://www.alberta.ca/iqas.aspx", official: true },
        { name: "ICAS", description: "International Credential Assessment Service of Canada.", url: "https://www.icascanada.ca", official: true },
      ],
      mistakes: [
        "Requesting the wrong report type for immigration.",
        "Submitting unofficial transcripts.",
        "Underestimating processing time.",
      ],
    },
    {
      id: "ee_profile",
      title: "Create your Express Entry profile",
      description: "Submit your profile to the Express Entry pool for consideration.",
      estimatedTime: "About 30 minutes",
      resources: [
        { name: "IRCC — Express Entry", description: "Official Government of Canada page for Express Entry.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html", official: true },
      ],
    },
    {
      id: "ita",
      title: "Receive an Invitation to Apply",
      description: "Wait for an ITA in a Canadian draw based on your CRS score.",
    },
    {
      id: "pr_application",
      title: "Submit your PR application",
      description: "Complete and submit your permanent residence application to IRCC.",
      estimatedTime: "6 months (average)",
    },
  ]),
  deriveStatuses: (ctx) => {
    const completed: string[] = ["profile"];
    if (ctx.answers.english_test === "yes") completed.push("english_test");
    if (ctx.answers.eca === "yes") completed.push("eca");
    // Current is first non-completed step
    const order = ["profile", "english_test", "eca", "ee_profile", "ita", "pr_application"];
    const current = order.find((id) => !completed.includes(id)) ?? "pr_application";
    return fillStatuses(CANADA_PR.steps, current, completed);
  },
  deriveConfidence: (ctx) => {
    const p = ctx.profile;
    let score = 0;
    if (p.qualification) score++;
    if (p.profession ?? p.occupation) score++;
    if (ctx.answers.english_test === "yes") score++;
    if (ctx.answers.experience === "3-5" || ctx.answers.experience === "5+") score++;
    if (ctx.answers.eca === "yes") score++;
    if (score >= 4) return { level: "High" };
    if (score >= 2) return { level: "Medium", note: "Complete more of your profile to improve the accuracy of this recommendation." };
    return { level: "Low", note: "Complete more of your profile to improve the accuracy of this recommendation." };
  },
  buildReasons: (ctx) => {
    const out = baseReasons(ctx);
    if (ctx.answers.experience === "3-5" || ctx.answers.experience === "5+")
      out.push("You have the level of work experience typically favoured by Express Entry.");
    if (ctx.answers.english_test === "yes")
      out.push("You've already completed an approved English language test.");
    if (ctx.answers.eca === "yes")
      out.push("Your Educational Credential Assessment is already complete.");
    return out;
  },
};

/* ---------------- Generic fallbacks per kind ---------------- */

function genericBlueprint(kind: Kind, country?: string): OpportunityBlueprint {
  const label = KIND_LABEL[kind];
  const displayName = country ? `${label} in ${country}` : label;

  const commonProfileStep: PlanStep = {
    id: "profile",
    title: "Confirm your profile details",
    description: "Make sure your education and profession are current so we can match you to the right next step.",
    estimatedTime: "About 15 minutes",
  };

  const stepsByKind: Record<Kind, PlanStep[]> = {
    pr: [
      commonProfileStep,
      {
        id: "language",
        title: "Language proficiency",
        description: "Prepare for the language test accepted in your destination.",
        estimatedTime: "2–6 weeks",
      },
      {
        id: "credentials",
        title: "Credential recognition",
        description: "Have your qualifications assessed by an approved body.",
        estimatedTime: "6–12 weeks",
      },
      {
        id: "application",
        title: "Submit your application",
        description: "Complete the permanent residence application for your destination.",
      },
    ],
    work: [
      commonProfileStep,
      {
        id: "cv",
        title: "Localise your CV",
        description: "Adapt your CV to the destination market's expectations.",
        estimatedTime: "1–2 weeks",
      },
      {
        id: "search",
        title: "Job search",
        description: "Apply to employers offering sponsorship or open to international hires.",
      },
      {
        id: "offer",
        title: "Offer & work visa",
        description: "Secure an offer and prepare the work visa application.",
      },
    ],
    study: [
      {
        id: "profile",
        title: "Confirm your qualification",
        description: "Make sure your prior education details are complete and accurate.",
        estimatedTime: "About 15 minutes",
      },
      {
        id: "shortlist",
        title: "Shortlist programmes",
        description: "Identify programmes that match your background and goals.",
      },
      {
        id: "materials",
        title: "Prepare application materials",
        description: "Transcripts, statement of purpose, references, and language test.",
      },
      {
        id: "apply",
        title: "Submit applications",
        description: "Apply to your shortlisted programmes.",
      },
    ],
    scholarship: [
      {
        id: "eligibility",
        title: "Confirm eligibility basics",
        description: "Check your qualification, field and nationality against common scholarship criteria.",
        estimatedTime: "About 15 minutes",
      },
      {
        id: "shortlist",
        title: "Shortlist scholarships",
        description: "Identify scholarships you may qualify for.",
      },
      {
        id: "materials",
        title: "Prepare application materials",
        description: "Statement of purpose, references, transcripts.",
      },
      {
        id: "apply",
        title: "Submit applications",
        description: "Apply before each scholarship deadline.",
      },
    ],
  };

  const steps = autoWhatsNext(stepsByKind[kind]);

  const questionsByKind: Record<Kind, Question[]> = {
    pr: [
      {
        id: "language_test",
        prompt: "Have you completed an approved language test?",
        helper: country
          ? `Most ${country} pathways require a recent English or local language test.`
          : "Most permanent residence pathways require a recent language test.",
        why: "Language proficiency is one of the strongest factors in permanent residence eligibility and points systems.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "planning", label: "Planning to" },
        ],
      },
      {
        id: "language_score",
        prompt: "Do you already have your test score?",
        helper: "If yes, we'll use it to estimate your points more accurately.",
        why: "Your exact score determines how many points you're awarded on most PR routes.",
        options: [
          { value: "high", label: "Yes — a strong score" },
          { value: "mid", label: "Yes — a moderate score" },
          { value: "low", label: "Yes — a lower score" },
          { value: "no", label: "Not yet" },
        ],
      },
      {
        id: "experience",
        prompt: "How many years of relevant work experience do you have?",
        why: "Skilled work experience is a major factor in almost every PR points system.",
        options: [
          { value: "<1", label: "Less than 1 year" },
          { value: "1-2", label: "1–2 years" },
          { value: "3-5", label: "3–5 years" },
          { value: "5+", label: "5+ years" },
        ],
      },
      {
        id: "credentials",
        prompt: "Have your qualifications been assessed for this country?",
        helper: "Some countries require a credential assessment before applying.",
        why: "Foreign qualifications usually need to be formally recognised before they count towards eligibility.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "unsure", label: "Not sure" },
        ],
      },
      {
        id: "licence",
        prompt: "Is your profession regulated or licensed in your destination?",
        helper: "For example: healthcare, engineering, law, teaching.",
        why: "Regulated professions often need local licensing before you can work.",
        options: [
          { value: "yes_have", label: "Yes — I already hold local recognition" },
          { value: "yes_need", label: "Yes — I still need it" },
          { value: "no", label: "No — my profession isn't regulated" },
          { value: "unsure", label: "Not sure" },
        ],
      },
      {
        id: "passport",
        prompt: "Do you currently hold a valid passport?",
        why: "A valid passport is required before submitting any immigration application.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "expiring", label: "Yes, but expiring soon" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "prior_international",
        prompt: "Have you previously studied or worked abroad?",
        why: "Prior international experience can strengthen certain PR applications.",
        options: [
          { value: "work", label: "Yes — I've worked abroad" },
          { value: "study", label: "Yes — I've studied abroad" },
          { value: "both", label: "Both" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "marital",
        prompt: "What is your marital status?",
        helper: "Some PR routes award additional points for spouse qualifications.",
        why: "A spouse's education or language ability can add points on several PR systems.",
        options: [
          { value: "single", label: "Single" },
          { value: "partner", label: "Partner / Common-law" },
          { value: "married", label: "Married" },
          { value: "prefer_not", label: "Prefer not to say" },
        ],
      },
      {
        id: "dependants",
        prompt: "Will any dependants be moving with you?",
        why: "Dependants affect application costs and proof-of-funds requirements.",
        options: [
          { value: "none", label: "No dependants" },
          { value: "1", label: "1 dependant" },
          { value: "2", label: "2 dependants" },
          { value: "3+", label: "3 or more" },
        ],
      },
      {
        id: "timeline",
        prompt: "When would you ideally like to move?",
        why: "Your timeline helps us pace your roadmap and flag time-sensitive steps.",
        options: [
          { value: "0-6", label: "Within 6 months" },
          { value: "6-12", label: "6–12 months" },
          { value: "1-2y", label: "1–2 years" },
          { value: "flexible", label: "I'm flexible" },
        ],
      },
      {
        id: "budget",
        prompt: "What's your approximate budget for this move? (optional)",
        helper: "Rough range only — this stays private and helps us set realistic milestones.",
        why: "Application, test, assessment and relocation costs add up. A rough budget helps us plan.",
        options: [
          { value: "<5k", label: "Under £5,000" },
          { value: "5-15k", label: "£5,000–£15,000" },
          { value: "15k+", label: "£15,000+" },
          { value: "skip", label: "Prefer not to say" },
        ],
      },
    ],
    work: [
      {
        id: "experience",
        prompt: "How many years of relevant work experience do you have?",
        why: "Most work visas and employers require a minimum level of relevant experience.",
        options: [
          { value: "<1", label: "Less than 1 year" },
          { value: "1-2", label: "1–2 years" },
          { value: "3-5", label: "3–5 years" },
          { value: "5+", label: "5+ years" },
        ],
      },
      {
        id: "sponsorship",
        prompt: "Do you need visa sponsorship?",
        why: "Some employers only consider candidates who already have work rights.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "unsure", label: "Not sure" },
        ],
      },
      {
        id: "language_test",
        prompt: "Have you completed a language test recognised in your destination?",
        why: "Some work visas require proof of language ability at a minimum level.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "not_required", label: "Not required" },
        ],
      },
      {
        id: "language_score",
        prompt: "Do you already have your test score?",
        helper: "Optional — helps us judge whether you meet visa thresholds.",
        why: "Your exact score determines whether you clear common work-visa language minimums.",
        options: [
          { value: "high", label: "Yes — a strong score" },
          { value: "mid", label: "Yes — a moderate score" },
          { value: "low", label: "Yes — a lower score" },
          { value: "no", label: "Not yet" },
        ],
      },
      {
        id: "licence",
        prompt: "Is your profession regulated or licensed abroad?",
        helper: "For example: healthcare, engineering, law, teaching, finance.",
        why: "Regulated professions may need local recognition before you can start work.",
        options: [
          { value: "yes_have", label: "Yes — I already hold recognition" },
          { value: "yes_need", label: "Yes — I still need it" },
          { value: "no", label: "No" },
          { value: "unsure", label: "Not sure" },
        ],
      },
      {
        id: "passport",
        prompt: "Do you currently hold a valid passport?",
        why: "You'll need a valid passport before any work visa can be issued.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "expiring", label: "Yes, but expiring soon" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "prior_international",
        prompt: "Have you previously worked or studied abroad?",
        why: "International experience can strengthen your CV for global employers.",
        options: [
          { value: "work", label: "Yes — worked abroad" },
          { value: "study", label: "Yes — studied abroad" },
          { value: "both", label: "Both" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "timeline",
        prompt: "When would you like to start working abroad?",
        why: "Your timeline determines which roles and visa routes are realistic.",
        options: [
          { value: "0-3", label: "Within 3 months" },
          { value: "3-6", label: "3–6 months" },
          { value: "6-12", label: "6–12 months" },
          { value: "flexible", label: "I'm flexible" },
        ],
      },
    ],
    study: [
      {
        id: "level",
        prompt: "What level of study are you considering?",
        why: "Programme requirements, funding and visa rules differ by study level.",
        options: [
          { value: "bachelor", label: "Bachelor's" },
          { value: "master", label: "Master's" },
          { value: "phd", label: "PhD / Doctorate" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "grades",
        prompt: "How would you describe your most recent academic results?",
        helper: "A rough sense is fine — this helps us match realistic programmes.",
        why: "Programmes and scholarships often have minimum grade requirements.",
        options: [
          { value: "top", label: "Top of my cohort" },
          { value: "strong", label: "Strong" },
          { value: "average", label: "Average" },
          { value: "mixed", label: "Mixed" },
        ],
      },
      {
        id: "language_test",
        prompt: "Have you completed an approved language test?",
        why: "Most universities require proof of language proficiency for admission.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "planning", label: "Planning to" },
        ],
      },
      {
        id: "language_score",
        prompt: "Do you already have your test score?",
        helper: "Optional — helps us match programmes you'd qualify for today.",
        why: "Universities set specific minimum scores for admission.",
        options: [
          { value: "high", label: "Yes — a strong score" },
          { value: "mid", label: "Yes — a moderate score" },
          { value: "low", label: "Yes — a lower score" },
          { value: "no", label: "Not yet" },
        ],
      },
      {
        id: "budget",
        prompt: "What is your approximate annual budget?",
        why: "Tuition and living costs vary widely — your budget shapes what's realistic.",
        options: [
          { value: "<10k", label: "Under £10,000" },
          { value: "10-25k", label: "£10,000–£25,000" },
          { value: "25k+", label: "£25,000+" },
          { value: "scholarship", label: "I need a scholarship" },
        ],
      },
      {
        id: "passport",
        prompt: "Do you currently hold a valid passport?",
        why: "You'll need a valid passport for your student visa application.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "expiring", label: "Yes, but expiring soon" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "prior_international",
        prompt: "Have you previously studied abroad?",
        why: "Prior international study can strengthen future applications.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "exchange", label: "Only a short exchange" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "intake",
        prompt: "Which intake are you targeting?",
        why: "Deadlines and preparation time depend on the intake you're aiming for.",
        options: [
          { value: "next", label: "Next available" },
          { value: "6-12m", label: "In 6–12 months" },
          { value: "1y+", label: "More than a year away" },
        ],
      },
    ],
    scholarship: [
      {
        id: "level",
        prompt: "What level of study is the scholarship for?",
        why: "Different scholarships target different study levels.",
        options: [
          { value: "bachelor", label: "Bachelor's" },
          { value: "master", label: "Master's" },
          { value: "phd", label: "PhD / Doctorate" },
        ],
      },
      {
        id: "grades",
        prompt: "How would you describe your academic results?",
        helper: "Most scholarships weigh grades heavily.",
        why: "Academic results are usually one of the top scholarship selection criteria.",
        options: [
          { value: "top", label: "Top of my cohort" },
          { value: "strong", label: "Strong" },
          { value: "average", label: "Average" },
          { value: "mixed", label: "Mixed" },
        ],
      },
      {
        id: "field",
        prompt: "Is your field of study confirmed?",
        why: "Most scholarships are tied to specific fields or research areas.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "shortlist", label: "I have a shortlist" },
          { value: "no", label: "Not yet" },
        ],
      },
      {
        id: "language_test",
        prompt: "Have you completed an approved language test?",
        why: "Most scholarships require proof of language proficiency.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "planning", label: "Planning to" },
        ],
      },
      {
        id: "language_score",
        prompt: "Do you already have your test score?",
        helper: "Optional — helps us judge whether you clear scholarship minimums.",
        why: "Scholarships often set a specific minimum score.",
        options: [
          { value: "high", label: "Yes — a strong score" },
          { value: "mid", label: "Yes — a moderate score" },
          { value: "low", label: "Yes — a lower score" },
          { value: "no", label: "Not yet" },
        ],
      },
      {
        id: "funding_need",
        prompt: "How much of your costs would the scholarship need to cover?",
        why: "Some scholarships are partial and some are fully funded — this narrows the shortlist.",
        options: [
          { value: "full", label: "Fully funded (tuition + living)" },
          { value: "tuition", label: "Tuition only" },
          { value: "partial", label: "Any contribution helps" },
        ],
      },
      {
        id: "references",
        prompt: "Do you have academic references ready?",
        why: "Most scholarships require two or more strong academic references.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "partial", label: "Partially" },
          { value: "no", label: "Not yet" },
        ],
      },
    ],
  };

  return {
    key: `${kind}:${country ?? "*"}`,
    kind,
    country,
    displayName,
    questions: questionsByKind[kind],
    steps,
    deriveStatuses: () => fillStatuses(steps, steps[0].id, []),
    deriveConfidence: (ctx) => {
      const p = ctx.profile;
      let score = 0;
      if (p.qualification) score++;
      if (p.profession ?? p.occupation) score++;
      if (ctx.country && (p.countries_of_interest ?? []).includes(ctx.country)) score++;
      if (score >= 3) return { level: "High" };
      if (score >= 1) return { level: "Medium", note: "Complete more of your profile to improve the accuracy of this recommendation." };
      return { level: "Low", note: "Complete more of your profile to improve the accuracy of this recommendation." };
    },
    buildReasons: (ctx) => baseReasons(ctx),
  };
}

const REGISTRY: OpportunityBlueprint[] = [CANADA_PR];

export function resolveBlueprint(kind: Kind, country?: string): OpportunityBlueprint {
  const exact = REGISTRY.find((b) => b.kind === kind && b.country === country);
  if (exact) return exact;
  return genericBlueprint(kind, country);
}

export function parseJourneyId(id: string): { kind: Kind; country?: string } {
  const [prefix, ...rest] = id.split("-");
  const kindMap: Record<string, Kind> = { pr: "pr", work: "work", study: "study", scholarship: "scholarship", sch: "scholarship" };
  const kind = kindMap[prefix] ?? "work";
  const slug = rest.join("-");
  const known = ["Canada", "Australia", "Germany", "United Kingdom", "Ireland", "United States", "New Zealand"];
  const country = known.find((c) => c.toLowerCase().replace(/\s+/g, "-") === slug);
  return { kind, country };
}

export function currentStep(blueprint: OpportunityBlueprint, statuses: Record<string, StepStatus>): PlanStep {
  const inProgress = blueprint.steps.find((s) => statuses[s.id] === "in_progress");
  return inProgress ?? blueprint.steps[0];
}

export const COUNTRY_FLAG: Record<string, string> = {
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  "United Kingdom": "🇬🇧",
  Ireland: "🇮🇪",
  "United States": "🇺🇸",
  "New Zealand": "🇳🇿",
};