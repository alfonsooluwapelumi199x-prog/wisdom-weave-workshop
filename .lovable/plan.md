## Goal

Build the "View Journey" experience: after tapping View Journey on the Results page, the user answers a short set of opportunity-specific personalisation questions (one per screen, conversational), then lands on a personalised Opportunity Plan. Existing UI, colours, typography, animations, navigation, landing, onboarding, and Results page stay untouched. Reuse the ForMe component library and white + lilac palette.

## User flow (unchanged upstream)

Results → View Journey → Personalisation Questions → Opportunity Plan
Landing, onboarding, and Results are not modified.

## Routes

- `src/routes/journey.$id.personalise.tsx` — new. One conversational question per screen. Progress bar. Header: "Let's make this plan yours. This will take less than one minute." Persists answers to `localStorage` (`forme.journey_answers.<id>`). On completion → `/journey/$id`.
- `src/routes/journey.$id.tsx` — rewritten to be the Opportunity Plan (the current placeholder journey page is replaced, not redesigned in style — same tokens, same component library, same white/lilac aesthetic). If no personalisation answers exist yet for this id, redirect to `/journey/$id/personalise`.
- Results page: only change is the `View Journey` button now routes into the personalisation flow via the same `/journey/$id` id (no navigation shape change — the id already exists). No visual change to Results.

## Opportunity model (reusable, no hardcoded country/pathway)

Add `src/lib/opportunity-plans.ts` — a pure data module the plan page consumes. Everything (questions, steps, resources, mistakes, timing, cost, what's next) is described per opportunity `kind` (`pr` | `work` | `study` | `scholarship`) and optionally per `country`. Structure:

```
type Question = {
  id: string;
  prompt: string;
  helper?: string;
  options: { value: string; label: string }[];
};

type PlanStep = {
  id: string;                 // e.g. "english_test"
  title: string;              // "English language test"
  description: string;
  estimatedTime?: string;     // "2–6 weeks"
  estimatedCost?: string;     // "£180–£250" — omitted if unreliable
  resources?: Resource[];     // official orgs only
  mistakes?: string[];        // max 3
  whatsNext?: string;         // one line
};

type Resource = { name: string; description: string; url: string; official: true };

type OpportunityBlueprint = {
  key: string;                          // `${kind}:${country ?? "*"}`
  kind: "pr" | "work" | "study" | "scholarship";
  country?: string;
  displayName: string;                  // "Express Entry — Canada", "Skilled Worker Visa — UK", etc.
  questions: Question[];                // ONLY what's needed for this opportunity
  steps: PlanStep[];                    // ordered roadmap
  // derives status from user's answers + profile, and picks the single current step
  deriveStatuses: (ctx: PlanContext) => Record<string /* step.id */, "completed"|"in_progress"|"not_started"|"locked">;
  // derives confidence from answers + profile
  deriveConfidence: (ctx: PlanContext) => { level: "High"|"Medium"|"Low"; note?: string };
  // personalised reasons (only from known info)
  buildReasons: (ctx: PlanContext) => string[];
};
```

`PlanContext = { profile: Pending; answers: Record<string,string>; country?: string; kind: Kind }`.

The registry resolves an id like `pr-canada` → blueprint. Seed blueprints:

- `pr:Canada` (Express Entry): questions = English test status, work experience band, ECA status. Steps = Profile check → English test → ECA → Express Entry profile → Invitation → PR application.
- `pr:*` (generic PR fallback): profile check → language test → credential recognition → application.
- `work:*`: profile check → CV localisation → job search → application → offer/visa.
- `study:*`: qualification check → shortlist programmes → application materials → applications → visa.
- `scholarship:*`: eligibility → shortlist → materials → applications.

Only Canada PR ships with country-specific detail in this pass; every other combination falls back to a generic blueprint using the same schema, so the page is fully populated for any kind/country and adding new opportunities later is a data-only change. No new hardcoded strings inside the page component.

## Personalisation screen (`journey.$id.personalise.tsx`)

- Reads `id`, resolves blueprint (`pr:Canada` → Canada PR; anything else → generic `<kind>:*`).
- If blueprint has zero questions → skip straight to `/journey/$id`.
- One question per screen, framer-motion transition matching existing style, progress dots at top, `Back` / `Next` buttons, uses existing `Button` + tokens.
- Top eyebrow copy: "Let's make this plan yours." Sub: "This will take less than one minute."
- Persists to `localStorage["forme.journey_answers." + id]`.
- Final Next → navigate to `/journey/$id`.

## Opportunity Plan page (`journey.$id.tsx`)

Reuses existing ForMe components and tokens — no new visual system. Sections top to bottom:

1. `CountryHeader` — flag + country + `blueprint.displayName` (falls back to opportunity title when country unknown, e.g. worldwide search).
2. Opportunity Confidence card — new small component `ConfidenceCard` in `src/components/forme/` displaying `High` / `Medium` / `Low` chip + line "Based on the information you've shared so far." + optional note "Complete more of your profile to improve the accuracy of this recommendation." Uses existing tokens; no new palette.
3. `WhyFitsCard` — points from `blueprint.buildReasons(ctx)`. Only uses profile + answers; never age/budget/marital/etc.
4. Your Opportunity Plan — vertical roadmap via existing `JourneyTimeline`, with statuses from `deriveStatuses`. Exactly one step marked `in_progress`.
5. Your Next Action — `NextActionCard`, large, single button. Title = current step's title; description = current step's description; CTA = "Start This Step" scrolling to the resources section (or opening the first official resource if present).
6. Estimated Time — small card, `currentStep.estimatedTime` only. Hidden if unset.
7. Estimated Cost — small card, `currentStep.estimatedCost` only. Hidden if unset.
8. Official Resources — new component `OfficialResourceCard` (small extension of existing `ResourceCard`) rendering the current step's resources with an "Official" badge, description, and "Open Official Website" button. Only current step's resources shown.
9. Common Mistakes — new small `MistakesList` component (tokens-based, no redesign) — max 3 items from `currentStep.mistakes`. Hidden if none.
10. What's Next — plain card with `currentStep.whatsNext`, computed as "After completing <current>, your next step will be <next step title>." Auto-generated from the roadmap when the blueprint doesn't override.
11. Save Progress — reuses the existing bottom CTA pattern from the current journey page (Save My Journey → `/auth`, Continue Exploring → `/results`). No visual redesign.

Add `ImproveRecommendationCard` just above the save-progress block, unchanged.

## New / touched components (ForMe library)

- add: `src/components/forme/ConfidenceCard.tsx`
- add: `src/components/forme/OfficialResourceCard.tsx` (wraps existing `ResourceCard` styling; adds "Official" badge and CTA button label)
- add: `src/components/forme/MistakesList.tsx`
- export the three from `src/components/forme/index.ts`
- no changes to existing components' props or visuals.

## Files touched

- add: `src/routes/journey.$id.personalise.tsx`
- edit: `src/routes/journey.$id.tsx` (replace body; keep tokens + component library)
- add: `src/lib/opportunity-plans.ts`
- add: `src/components/forme/ConfidenceCard.tsx`
- add: `src/components/forme/OfficialResourceCard.tsx`
- add: `src/components/forme/MistakesList.tsx`
- edit: `src/components/forme/index.ts` (barrel exports)

No changes to: landing, onboarding, loading, auth, dashboard, Results page UI, tokens, existing ForMe components, router, or `__root.tsx`.

## Guardrails

- No new dependencies.
- Never fabricate user data (no assumed age, budget, marital, licensing, English scores) — reasons and confidence use only profile fields + personalisation answers.
- Only the current step's resources / time / cost / mistakes are shown; other steps stay collapsed in the roadmap.
- Fully reusable: any kind/country resolves to a blueprint (specific or generic) and populates the same page — no hardcoded Canada/Express Entry in the component.
