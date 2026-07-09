
# Premium Lilac Rebrand + Hero Elevation

Scope: only `src/styles.css`, `src/routes/index.tsx` (hero section), and `src/components/marketing/globe.tsx`. No new sections, no other routes touched.

## 1. Color system (src/styles.css)

Replace the current teal/cyan tokens with the new lilac palette, keeping `oklch()` format and the `@theme inline` mapping intact.

New semantic tokens (both `:root` and `.dark` — identical, dark-only app):

- `--background` → Deep Midnight Navy `#08111F`
- `--foreground` → Soft White `#F8FAFC`
- `--card` / `--popover` → slightly lifted midnight
- `--primary` → Soft Lilac `#C8B6FF` (replaces electric teal)
- `--primary-foreground` → midnight
- `--secondary` / `--accent` → Lavender Purple `#A78BFA`
- `--ring` → Soft Lilac
- `--emerald` → `#10B981` (kept, success only)
- New: `--violet` → Soft Violet `#8B5CF6` (glow), `--lilac` → `#C8B6FF`, `--lavender` → `#A78BFA`
- Remove/retire: turquoise/cyan usages; `--gold` kept but unused in the hero
- Add gradient + shadow tokens:
  - `--gradient-primary`: `linear-gradient(135deg, var(--lavender), var(--violet))`
  - `--gradient-hero`: radial midnight → violet-tinted midnight
  - `--shadow-premium`: soft violet glow shadow used by CTA + globe

Register the new colors in `@theme inline` (`--color-lilac`, `--color-lavender`, `--color-violet`) so utilities like `bg-lilac`, `text-lavender` work.

## 2. Globe upgrades (src/components/marketing/globe.tsx)

Recolor and animate:

- Swap cyan/teal SVG gradients (`pinGlow`, meridian stroke, halo) to lilac + violet. Central glow uses violet at core → lilac mid → transparent edge.
- Increase pin count from current few to ~9 pulsing pins on plausible destination coords; each pin: small lilac dot + expanding lilac ring (`animate` opacity/scale, staggered delays, 3–4s cycle) — calm, not flashy.
- Add 3 subtle curved arc lines (SVG paths with `strokeDasharray` + animated `strokeDashoffset`) connecting pins, drawn with lilac at ~25% opacity.
- Increase orbiting particle count slightly, tint lilac.
- Keep continuous rotation (existing meridian rotation), same slow speed.

Props unchanged; still accepts `compact` and `highlighted`.

## 3. Hero section (src/routes/index.tsx → `Hero`)

Layout stays 2-column on desktop, globe on right. Refinements:

- Background: add a soft radial gradient behind the whole hero (violet at ~8% opacity, top-center) plus a large blurred violet orb behind the globe (`bg-violet/20 blur-[140px]`). Remove teal/emerald orbs from hero.
- Text block spacing:
  - Eyebrow gap tightened, larger `mt-8` between h1 and tagline, `mt-6` before supporting copy.
  - Headline: keep "Welcome to ForMe" with gradient on "ForMe" using lilac → violet.
  - Tagline (light, 2xl): "Find the opportunities made for you."
  - Supporting line (muted): "One profile. Personalised opportunities. Clear next steps."
  - New trust line under supporting copy, small caps or muted italic:
    - "Not an immigration agency. Not a job board. A discovery platform built around you."
- CTAs:
  - Primary "Get Started" — uses `--gradient-primary` background, soft violet drop shadow, subtle inner highlight, hover lift.
  - Secondary "See how it works" — ghost with lilac hover ring/border.
- Under the globe (or globe column, bottom-centered): a small animated status line:
  - Small pulsing lilac dot + text "Searching the world for opportunities made for you…"
  - Uses framer-motion opacity pulse (2s ease), not a spinner.
- Add subtle labels floating around the globe: Canada, Germany, Australia, Ireland, Sweden. Absolutely positioned around the globe container at approximate compass positions, `text-[11px] uppercase tracking-[0.2em] text-foreground/50`, with a tiny lilac dot before each label. Fade-in staggered on mount.

Nav, other sections (SectionTwo–Five, Footer) untouched aside from inheriting new tokens.

## Out of scope

- No changes to other sections, no new routes, no auth/backend changes.
- Gold token stays defined but unused in hero; other sections continue to reference it.
- No new dependencies.

## Verification

After edits: reload preview, confirm hero renders with lilac palette, globe glows violet, labels + status line visible, CTAs show gradient + shadow, no console/build errors.
