## Goal

Move authentication out of the front of the flow. Users should experience Build My Profile → Searching → Results with no login wall, and only sign in afterward to save their journey.

## New flow

```
Landing (/)
  → Get Started
Build My Profile (/onboarding)         [PUBLIC]
  → 6 questions → Review → Discover My Opportunities
Searching the World (/loading)         [PUBLIC]
Results (/results)                     [PUBLIC — placeholder]
  → Save Your Journey
Auth (/auth)                           [PUBLIC — repositioned]
  → after sign-in, persist stashed profile
My World Dashboard (/dashboard)        [PROTECTED — minimal placeholder]
```

## Changes

**1. Make onboarding + loading + results public**
- Move the three route files out of `src/routes/_authenticated/` to `src/routes/onboarding.tsx`, `src/routes/loading.tsx`, `src/routes/results.tsx` (update the `createFileRoute` path in each).
- Answers are stored in `localStorage` under a single key (`forme.pending_profile`) at the end of onboarding, instead of being sent to the server. The rest of the onboarding UI stays exactly as it is (same questions, same design, same review screen, same Discover My Opportunities button).
- `/loading` reads nothing from the server — same animation, same timing, then navigates to `/results`.
- `/results` reads the pending profile from `localStorage` and shows the existing placeholder ("Your personalised journey is being prepared"). Primary CTA changes to **Save Your Journey** → navigates to `/auth?next=/dashboard`.

**2. Reposition and rebrand the auth screen (`/auth`)**
- Heading: **Save Your Journey**
- Subheading: *Create your free account to save your personalised opportunities, continue where you left off, and receive future opportunity updates.*
- Keep Continue with Google. Keep email/password. Same ForMe visual language (midnight background, lilac accents).
- After a successful sign-in/sign-up, if `localStorage` has a pending profile, save it via the existing `saveOnboarding` server function, clear the key, then navigate to `/dashboard`. If none exists, navigate straight to `/dashboard`.
- Remove the auto-redirect that fires when the page loads with an existing session — signed-in users landing here from Results should still get the "save your journey" hand-off; only the post-submit navigation should redirect.

**3. My World Dashboard (`/dashboard`)**
- Currently redirects to `/results`. Replace with a minimal placeholder page under `_authenticated/` so it remains protected: greeting + one line ("Your personalised opportunities are coming soon") + sign-out affordance already in AppShell. No visa cards, no AI Chat, no long briefing paragraphs, no Lithuania content — all already removed.

**4. Landing page**
- No visual changes. Confirm Get Started still points to `/onboarding` (it does).

**5. Cleanup**
- Delete the now-empty `/_authenticated/chat` redirect route (Chat is gone from the flow entirely).
- `_authenticated` layout stays as-is, guarding only `/dashboard`.

## Out of scope

- Homepage redesign.
- Real results/recommendations engine.
- Any change to onboarding questions, copy, or visuals.
- Any change to the Searching the World animation.

## Technical notes

- Pending profile shape stored in `localStorage`: the same object currently passed to `saveOnboarding` (`country_of_residence`, `nationality`, `qualification`, `occupation`, `main_goal`, `countries_of_interest`).
- `saveOnboarding` already requires auth via `requireSupabaseAuth`; it will be called only from `/auth` after sign-in succeeds, so it stays protected and the bearer middleware in `src/start.ts` continues to work.
- File moves regenerate `src/routeTree.gen.ts` automatically — no manual edits there.
