
## Surgical fixes — no redesign, no file replacement

All edits are the smallest possible diffs to the files listed. Every existing section, component, route, resource, mistake list, program name, and CTA is preserved.

---

### File 1 — `src/lib/opportunity-plans.ts` (shared foundation, edit first)

**Add a new exported helper (append near existing helpers, no removal):**

```ts
// Deterministic signature used by /loading and /results to decide
// whether the cached recommendation set still matches the current profile.
export function profileSignature(p: Pending): string {
  const parts = [
    p.main_goal ?? "",
    p.qualification ?? "",
    p.profession ?? p.occupation ?? "",
    [...(p.countries_of_interest ?? [])].sort().join("|"),
  ];
  return parts.join("::");
}
```

**Add a shared eligibility gate (no removal):**

```ts
export function hasCoreEligibility(ctx: PlanContext): boolean {
  const a = ctx.answers ?? {};
  switch (ctx.kind) {
    case "pr":
      // Canada PR keys: english_test, experience, eca
      // Generic PR keys: language_test, experience
      return Boolean(
        (a.english_test || a.language_test) && a.experience
      );
    case "work":
      return Boolean(a.language_test && a.experience);
    case "study":
      return Boolean(a.level && a.language_test);
    case "scholarship":
      return Boolean(a.level && a.language_test);
  }
}

export const ELIGIBILITY_STEP: PlanStep = {
  id: "eligibility",
  title: "Complete your eligibility details",
  description:
    "Complete your eligibility details so ForMe can assess your position and personalise your next step.",
};
```

**Change `CANADA_PR.deriveStatuses` (only this function body; keep every step, resource, mistake, whatsNext, and the `steps` array intact):**

- If `!hasCoreEligibility(ctx)`: return statuses in which every real step is `not_started`, and prepend the synthetic `eligibility` step (a companion `ELIGIBILITY_STEP` is exposed to consumers via `currentStep`).
- Otherwise: compute `completed` from real answers only (no auto-complete of `profile`):
  - `english_test` completed when `ctx.answers.english_test === "yes"`.
  - `eca` completed when `ctx.answers.eca === "yes"`.
  - `profile` completed when profile fields exist (qualification + profession present).
- Pick the first non-completed id from the existing order `["profile","english_test","eca","ee_profile","ita","pr_application"]`.

**Change the `english_test` step wording (only its `title` and `description`; keep resources and mistakes):**

- `title`: `"Choose an Approved Language Test"`
- `description`: `"Compare the approved language tests, choose the option that suits you best, and prepare before booking."`

The existing IELTS / CELPIP / PTE resources remain as supporting resources — no provider becomes the title.

**Change `genericBlueprint.deriveStatuses` (only this function; keep step arrays intact):**

- If `!hasCoreEligibility(ctx)`: mark every step `not_started` and let `currentStep` return the synthetic eligibility step.
- Otherwise: walk `steps` in order and pick the first whose corresponding eligibility answer is not `"yes"` / equivalent (e.g. PR: `language_test`, `credentials`; Work: `language_test`, `sponsorship`; Study/Scholarship: `language_test`, `grades`). Mark earlier ones `completed`.

**Change `currentStep` (small addition, no removal):**

```ts
export function currentStep(blueprint, statuses) {
  if (statuses["eligibility"] === "in_progress") return ELIGIBILITY_STEP;
  const inProgress = blueprint.steps.find(s => statuses[s.id] === "in_progress");
  return inProgress ?? blueprint.steps[0];
}
```

`deriveStatuses` sets `statuses["eligibility"] = "in_progress"` when the gate is closed.

---

### File 2 — `src/routes/loading.tsx`

**Shorten durations only (no visual/structural changes):**

- STEPS durations: `700, 700, 700, 700, 500` (was `3000, 3000, 3200, 3000, 2200`).
- Final fade delay: `250` (was `900`).
- Transition on the outer `motion.div`: reduce `duration` to `0.25` so the exit fade matches.
- Total ≈ 3.5s.

**Add a cache-skip on mount (before the timer effect):**

```ts
useEffect(() => {
  try {
    const rawP = localStorage.getItem("forme.pending_profile");
    const rawR = localStorage.getItem("forme.recommendations");
    const sig  = localStorage.getItem("forme.recs_signature");
    if (rawP && rawR && sig) {
      const p = JSON.parse(rawP);
      if (profileSignature(p) === sig) {
        navigate({ to: "/results", replace: true });
      }
    }
  } catch { /* ignore */ }
}, [navigate]);
```

Uses the shared `profileSignature` from `opportunity-plans.ts`. No other edits.

---

### File 3 — `src/routes/results.tsx`

**Add a persistence effect (do not touch existing `onOpen` write, JSX, or Section rendering):**

```ts
useEffect(() => {
  if (!pending) return;
  try {
    const all = [...recs.pr, ...recs.work, ...recs.study, ...recs.scholarship];
    localStorage.setItem(
      "forme.recommendations",
      JSON.stringify(all.map(c => ({
        id: c.id, kind: c.kind, country: c.country,
        displayName: c.programName, flag: c.flag,
      }))),
    );
    localStorage.setItem("forme.recs_signature", profileSignature(pending));
  } catch { /* ignore */ }
}, [pending, recs]);
```

Import `profileSignature` from `@/lib/opportunity-plans`. No UI changes.

---

### File 4 — `src/routes/journey.$id.tsx`

**Minimal conditional (no other edits):**

- Import `ELIGIBILITY_STEP` from `@/lib/opportunity-plans`.
- After `const active = currentStep(...)`, compute:
  ```ts
  const isEligibilityGate = active.id === "eligibility";
  const ctaLabel = isEligibilityGate ? "Complete Eligibility Details" : "Check My Eligibility";
  ```
- Pass `ctaLabel` to the existing `<NextActionCard>` in place of the hard-coded `"Check My Eligibility"`.
- The existing `onCta={openJourneyProfile}` already routes to `/journey/$id/personalise` — untouched.

Every other section (`ConfidenceCard`, `WhyFitsCard`, `JourneyTimeline`, `MetaCard`s, `OfficialResourceCard`s, `MistakesList`, `whatsNext`, `ImproveRecommendationCard`, Save My Journey block) stays exactly as-is.

---

### File 5 — `src/routes/auth.tsx`

**Non-blocking navigation + double-click guard (no visual change):**

- Replace `finish()`:
  ```ts
  const finish = () => {
    navigate({ to: "/dashboard" });
    void persistPending(save as unknown as ...).catch(err =>
      console.error("Background save failed", err)
    );
  };
  ```
- In the auto-session `useEffect`, when a session exists: `navigate` first, then fire `void persistPending(...)` in the background.
- `signIn` / `signUp`: keep the existing `setLoading(true)` and error paths; on success just `finish()` (no `await`).
- `google` / `apple`: `setLoading(true)` before the call, `finally { setLoading(false) }`, and add `disabled={loading}` to the Google, Apple, and "Continue with Email" buttons.

No copy, layout, or provider list changes.

---

### Files intentionally NOT changed

- `src/routes/journey.$id.details.tsx` — already persists `forme.last_journey`; no consistency issue observed.
- `src/routes/journey.$id.personalise.tsx` — flow already correct.
- `src/routes/journey.$id.eligibility.tsx` — summary page already correct.
- `src/routes/_authenticated/dashboard.tsx` — merge logic already reads `forme.recommendations`; the new Results effect makes that cache reliable.
- `src/routes/onboarding.tsx` — writes `forme.pending_profile` already.
- All `src/components/forme/*` components — unchanged. `NextActionCard` already accepts `ctaLabel` as a prop.

---

### Data model (unchanged names, one addition)

| Key | Purpose |
|---|---|
| `forme.pending_profile` | initial 6 answers |
| `forme.recommendations` | full rec set (now written on Results load AND on card click) |
| `forme.recs_signature` | **new** deterministic hash of profile fields; only read by `/loading` |
| `forme.last_journey` | selected program |
| `forme.journey_answers.<id>` | per-opportunity eligibility answers |
| `forme.opportunity_status` | My World statuses |
| `forme.active_opportunity` | active journey id |

Nothing renamed, cleared, or duplicated.

---

### Manual test checklist (matches the request's A–H)

- **A** Fresh onboarding → Searching shows all 5 messages → `/results` in ~3.5s.
- **B** From `/results` → Continue Exploring → return → no replay; cards appear instantly.
- **C** Fresh Express Entry Plan → Next Action = "Complete your eligibility details" → button "Complete Eligibility Details" → opens `/journey/$id/personalise` (not onboarding).
- **D** After core answers, with `english_test !== "yes"` → Next Action = "Choose an Approved Language Test" with IELTS/CELPIP/PTE listed as resources.
- **E** `english_test = yes`, `eca !== "yes"` → Next = credential assessment step.
- **F** Both complete → Next = Express Entry profile → ITA → PR application.
- **G** Save My Journey → `/dashboard` opens immediately; background save runs; second click blocked by `disabled={loading}`.
- **H** All preserved features render (program titles, Opportunity Details, preliminary-match text, Plan, eligibility flow, Eligibility Summary, Improve My Recommendations, My World, My Opportunities, Continue Journey, resources, mistakes).

---

### Completion report (to be produced after edits)

Will list: exact files edited, functions/lines changed, final animation total, signature algorithm, cache validation rule, eligibility keys per kind, Canada PR next-step decision table, generic next-step decision, confirmation CELPIP is not hard-coded, confirmation auth doesn't await the server, and confirmation no existing feature/section/route was removed.
