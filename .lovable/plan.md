# Sprint 3 — The Discovery Experience

Scope: only the transition between finishing onboarding and the (future) results page. Rework `src/routes/_authenticated/loading.tsx` and extend `src/components/marketing/globe.tsx` with a new "discovery" mode. No results page, no palette changes elsewhere, no new dependencies.

## 1. Globe: new `discovery` mode (`src/components/marketing/globe.tsx`)

Add an optional `mode?: "hero" | "discovery"` prop (default `"hero"`), keeping current hero behaviour untouched.

In `discovery` mode:

- Expand the pin dataset to ~24 real cities across every continent (Toronto, Vancouver, New York, Mexico City, São Paulo, Buenos Aires, London, Dublin, Paris, Amsterdam, Berlin, Stockholm, Lagos, Accra, Nairobi, Johannesburg, Dubai, Doha, Singapore, Tokyo, Seoul, Sydney, Melbourne, Auckland). Each has approximate `(cx, cy)` on the 480px SVG and a `continent` tag.
- Rolling illumination: on a ~2.2s interval, pick 3–4 pins to be "active" (violet glow + expanding ring), the rest are dim lilac dots. Stagger so the world always has motion somewhere.
- Floating city labels: at any time render 5–6 labels near their pins, `text-[11px] uppercase tracking-[0.2em] text-foreground/55` with a small violet dot. Each label fades in (0.8s), holds ~3s, fades out; new ones take their place, so names appear/disappear naturally as the globe rotates.
- Curved arcs: keep the existing arc system but sample from the wider pin list; 4 arcs animating in staggered loops.
- Particles: bump to ~22, tint mix of lilac and soft white (`var(--lilac)` and `var(--soft-white)`), slower duration.
- "Final selection" phase (driven by a new `focusPins?: string[]` prop): pins in `focusPins` stay fully illuminated (violet glow, larger ring), all others gently fade to ~15% opacity over 1.2s. Labels outside the focus set fade out; focus-set labels stay pinned.
- All colors use existing tokens (`--violet`, `--lilac`, `--soft-white`). No blue/cyan/teal.

## 2. Loading route redesign (`src/routes/_authenticated/loading.tsx`)

Full-screen premium experience, dark, calm.

Layout:

- Full-viewport dark container with a soft radial violet gradient background and a large blurred violet orb behind the globe. No card, no chrome.
- Centered globe at ~min(78vmin, 720px) — much larger than hero. `Globe mode="discovery"` fills the screen.
- Below the globe: message text + milestone dots. Above (or top-left corner on desktop): tiny "ForMe" wordmark, muted.

State machine (single `useEffect` with `setTimeout` chain, cleaned up on unmount):

| Step | Duration | Message                                             | Dots        | Extra                              |
| ---- | -------- | --------------------------------------------------- | ----------- | ---------------------------------- |
| 1    | 3s       | Searching the world for opportunities made for you… | ● ○ ○ ○     | globe in default discovery motion  |
| 2    | 3s       | Understanding your profile…                         | ● ● ○ ○     |                                    |
| 3    | 3s       | Finding your strongest matches…                     | ● ● ● ○     | begin narrowing: `focusPins` = 8   |
| 4    | 3s       | Building your personalised journey…                 | ● ● ● ●     | `focusPins` narrows to 5 (Canada, Germany, Australia, Ireland, United Kingdom, New Zealand, Sweden — pick 5) |
| 5    | 2s       | We found opportunities waiting for you.             | ● ● ● ●     | full-screen fade to background     |

- Total ~14s. After step 5, `navigate({ to: "/dashboard" })` (existing placeholder destination — Sprint 4 will replace).
- Messages crossfade with framer-motion (`AnimatePresence`, 0.6s opacity + 6px y). One message on screen at a time.
- Milestone dots: 4 circles, filled = `var(--violet)` with a soft glow, empty = 1px lilac ring at 30% opacity. Fill transitions animate width/opacity, no bounce.
- No percentage, no spinner, no "Loading". No skip button; entry is via onboarding completion.
- Respect `prefers-reduced-motion`: disable particle/arc animation, keep static illuminated globe and message crossfade only.

## 3. Onboarding hookup

`src/routes/_authenticated/onboarding.tsx` already routes to `/loading` on submit — leave as-is. Verify the redirect target is `/loading` and adjust only if it isn't.

## 4. Palette guardrail

Audit the two touched files for any residual blue/cyan/teal literal (`#0ea5e9`, `cyan-*`, `sky-*`, `teal-*`, `turquoise`, `oklch(... 220-240)` hue). Replace with lilac/violet/soft-white tokens. Do not touch other files' palettes in this sprint.

## Out of scope

- Results page / recommendations engine (Sprint 4).
- Landing page, onboarding steps, auth, database.
- New dependencies, new routes, dashboard changes.

## Verification

- Navigate onboarding → Discover My Opportunities → `/loading`.
- Confirm: globe fills screen, cities from every continent light up in rotation, labels appear/disappear, 4 messages crossfade in order, dots progress ●○○○ → ●●●●, final message shows, then fade + navigation to `/dashboard`.
- No blue/cyan anywhere; only lilac, violet, soft white on midnight.
- No console/build errors; reduced-motion still readable.
