
## Goal

Introduce a reusable ForMe component library and rework the Results page information hierarchy and recommendation logic — without redesigning existing screens, changing navigation, or altering the flow. Keep the current white + lilac palette.

## Design tokens (centralised)

Create `src/components/forme/tokens.ts` exporting the palette so every component pulls from one source:

- `bg: #F7F4FF`, `card: #FFFFFF`, `primary: #8B5CF6`, `secondary: #C8B6FF`, `success: #10B981`, `warning: #D97706`, `text: #1E1E2E`, `muted: #6B7280`, `border: #EEEAF6`

Remove any lingering blue/cyan values from `results.tsx` and `journey.$id.tsx` and swap to tokens. No other visual changes.

## Reusable components (`src/components/forme/`)

All components accept props only — nothing hardcoded to Canada / Express Entry / a specific opportunity.

1. `CountryHeader.tsx` — `{ flag, countryName, opportunityName }` → flag + country + opportunity title stack.
2. `CompatibilityCard.tsx` — `{ label, score?, reasons: {ok, text}[], mode: 'preliminary' | 'full' }`. In `preliminary` mode shows "Current Profile Fit" + reasons only (no % / circular indicator). In `full` mode shows a circular SVG indicator with score (kept for future when profile is complete).
3. `WhyFitsCard.tsx` — `{ title?, points: string[] }`. Default title "Why this was recommended". Bulleted list, no generic text — caller supplies personalised strings.
4. `NextActionCard.tsx` — `{ title, description?, ctaLabel, onCta }`. Large card, single primary button. Designed to sit near top of an Opportunity Plan.
5. `JourneyTimeline.tsx` — `{ steps: { n, title, description, status: 'completed'|'in_progress'|'not_started'|'locked' }[] }`. Vertical timeline; highlights the single active (in_progress) step.
6. `MilestoneTracker.tsx` — `{ milestones: { label, done }[] }`. Chip row with ✓ / ○. No percentages.
7. `ResourceCard.tsx` — `{ title, description, href }`. External link card.
8. `OpportunityCard.tsx` — `{ country, flag, opportunity, fit: {label, reasons}, nextAction, onView }`. Replaces the ad-hoc card in `results.tsx`.
9. `EmptyState.tsx` — `{ title, description, action? }`.
10. `Skeletons.tsx` — exports `OpportunityCardSkeleton`, `CompatibilityCardSkeleton`, `TimelineSkeleton`, `HeaderSkeleton`. Elegant shimmer using existing palette.

Plus a small `ImproveRecommendationCard.tsx` (used at bottom of a recommendation) with fixed copy: "Improve Your Recommendation — Complete your profile to receive a more accurate compatibility assessment and personalised action plan." Uses existing profile route as CTA.

## Results page hierarchy (`src/routes/results.tsx`)

Keep the current layout, globe, and section grid. Only reorder the top of the page and swap in the new components:

New top section (above the pathway grid), when a country and goal are known:

```
[Globe — highlights ONLY the selected country if exactly one is chosen]

<CountryHeader flag="🇨🇦" countryName="Canada" opportunityName="Permanent Residence Pathways" />

<CompatibilityCard mode="preliminary" label="Current Profile Fit"
  reasons={[
    { ok: true, text: "Your selected goal is Permanent Residence." },
    { ok: true, text: "Your education aligns with this opportunity." },
    { ok: true, text: "Your profession may align with this pathway." },
  ]} />

<WhyFitsCard points={[ ...same personalised bullets, profile-derived only ]} />
```

Then the existing pathway sections (rendered via new `OpportunityCard`).

At the bottom of the recommendation area (above the existing "Save My Journey" CTA), add `<ImproveRecommendationCard />`.

Title behaviour:
- Single country + single goal selected → `CountryHeader` uses that country and `"<Goal> Pathways"` (e.g. "Permanent Residence Pathways").
- Multiple / worldwide → keep existing "We searched the world for you." header, skip `CountryHeader`, still show `CompatibilityCard` + `WhyFitsCard` scoped to the goal.

Globe rule change: `highlightedCountries` = the user's actually-selected countries only. If "Discover Worldwide" / none, keep current worldwide behaviour.

## Recommendation logic changes

Rewrite `buildRecommendations` in `results.tsx` to use ONLY these fields:
`country_of_residence, nationality, qualification, profession, main_goal, countries_of_interest`.

Remove all references to:
- age, years of experience, English language tests, IELTS/PTE, credential assessment, ECA/VETASSESS, Anabin, marital status, budget, licensing, proof of funds, German B1, etc.

Replace numeric compatibility score (82/100) with `Current Profile Fit` (no number) built from personalised, transparent reasons:

- `✓ Your selected goal is <goal>.`
- `✓ Your education (<qualification>) aligns with this opportunity.` (only if qualification present)
- `✓ Your profession (<profession>) may align with this pathway.` (only if profession present)
- `✓ <country> is one of your preferred destinations.` (only if in `countries_of_interest`)
- Omit any bullet whose underlying field is missing — never fabricate.

Taglines rewritten to reference only known fields, e.g. `"${country} offers permanent residence pathways for people with your background."` — no invented requirements.

`OpportunityCard` on the results grid shows: country, opportunity name, "Current Profile Fit" label, the same personalised reasons, a single "Next Action: View Journey" button. No percentages, no fabricated warnings.

## Journey page (`src/routes/journey.$id.tsx`)

Refactor to consume the new components (no visual redesign):
- `CountryHeader` at top.
- `NextActionCard` immediately below (single next step derived from opportunity + profile — for MVP: "View Journey" / "Explore this pathway" style, no fabricated requirements).
- `JourneyTimeline` with generic, profile-safe steps per opportunity kind.
- `MilestoneTracker` using only milestones we can support today (Education, Occupation, Preferred Country) — chips reflect what the profile already has.
- `WhyFitsCard` with the same personalised bullets.
- `ImproveRecommendationCard` at the bottom.

No `ResourceCard` content yet — component exists in the library for later use; render an empty state slot on the journey page only if we have zero resources (uses `EmptyState`).

## Non-goals / guardrails

- No route changes, no navigation changes, no auth changes.
- No changes to `onboarding.tsx`, `loading.tsx`, `auth.tsx`, `_authenticated/dashboard.tsx`, `__root.tsx`.
- No new dependencies.
- No hardcoded country/opportunity strings inside components — all via props.
- Keep animations (framer-motion) and existing globe behaviour aside from the highlight rule.

## Files touched

- add: `src/components/forme/tokens.ts`
- add: `src/components/forme/{CountryHeader,CompatibilityCard,WhyFitsCard,NextActionCard,JourneyTimeline,MilestoneTracker,ResourceCard,OpportunityCard,EmptyState,Skeletons,ImproveRecommendationCard}.tsx`
- add: `src/components/forme/index.ts` (barrel)
- edit: `src/routes/results.tsx` (hierarchy + recommendation logic + use new components)
- edit: `src/routes/journey.$id.tsx` (consume new components; no visual redesign)
