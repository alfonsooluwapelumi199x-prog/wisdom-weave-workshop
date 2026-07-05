# Pelumi Opportunity Finder — Build Plan

An AI SaaS that helps users discover international opportunities (scholarships, sponsored jobs, skilled worker & study pathways) with personalized matching, document generation, and tracking.

## Stack adaptation

The PRD specifies Next.js, but this project runs **TanStack Start + React 19**. I'll adapt:
- **Next.js → TanStack Start** (same SSR/routing capabilities)
- **Supabase → Lovable Cloud** (managed Supabase, same features)
- **OpenAI → Lovable AI Gateway** (Gemini/GPT models, no key setup)
- **Stripe** → deferred to Phase 4 (needs user Stripe account)
- **Resend** → deferred to Phase 4 (needs API key)
- Tailwind + shadcn/ui + Framer Motion ✅ already available

## Design direction

Apple-inspired, minimal, dark-mode default. Inter font, soft shadows, rounded cards, subtle motion. I'll build one cohesive dark theme with a single restrained accent (not generic purple) — leaning toward a warm gold or deep teal to feel premium and distinct from typical AI SaaS.

## Phase 1 — Foundation, Auth, Onboarding, AI Chat

**Cloud enable**: turn on Lovable Cloud (auth + DB + AI Gateway).

**Schema** (with GRANTs + RLS):
- `profiles` (id, age, nationality, country_of_residence, qualification, occupation, years_experience, marital_status, countries_of_interest[], onboarding_complete)
- `user_roles` + `has_role()` (admin/user, standard pattern)
- `conversations`, `messages` (AI chat history)

**Routes**:
- `/` — marketing landing (hero, features, CTA)
- `/auth` — email/password sign in/up
- `/_authenticated/` layout with sidebar nav
- `/onboarding` — one-question-at-a-time wizard (8 steps), progress indicator, animated transitions
- `/dashboard` — after onboarding, shows Profile Summary + AI-generated Opportunities Worth Exploring, Why It Fits, Next Steps, Official Resources
- `/chat` — streaming AI chat with system prompt (opportunity advisor persona, disclaimer)

**Server functions**:
- `generateProfileInsights` — calls AI Gateway with profile, returns structured summary + opportunities
- `chatWithAI` — streaming chat endpoint
- Educational disclaimer + "never guarantee eligibility" baked into system prompt

## Phase 2 — Opportunities

**Schema**: `countries`, `opportunities`, `scholarships`, `employers` (sponsorship), `saved_items`, `applications` (tracker).

**Routes**:
- `/opportunities` — unified browse/filter (type, country, deadline)
- `/scholarships` — dedicated finder with filters
- `/sponsorship` — visa-sponsoring employer finder
- `/countries/$slug` — country explorer (pathways, cost of living, visa options)
- `/tracker` — kanban-style (Interested → Applied → Interview → Decision)

Seed initial data via migration for a handful of countries/scholarships/employers so it's usable day 1. AI can enrich/explain matches per profile.

## Phase 3 — Document Generation

**Schema**: `documents` (resume/cover_letter, JSON content, versions).

**Routes**:
- `/resume` — resume builder with AI drafting from profile, live preview, export
- `/cover-letter` — AI-generated per opportunity, tone controls
- PDF export via jsPDF or html2pdf (client-side, Worker-safe)

## Phase 4 — Admin, Notifications, Payments, Analytics

- **Admin CMS** `/admin/*` (role-gated): manage opportunities, scholarships, employers, countries, view feedback
- **Notifications** table + in-app bell + optional Resend emails (asks user for API key)
- **Subscriptions**: Stripe integration (free vs pro tier gating premium AI features) — asks user to connect Stripe
- **Analytics**: simple dashboard using existing tracking

## Technical details

- Route architecture: separate files per section (not hash anchors), each with unique `head()` metadata for SEO
- Auth-protected routes under `_authenticated/` layout with route gate
- AI calls via `createServerFn` with `requireSupabaseAuth` middleware
- All colors as semantic tokens in `src/styles.css` (no hardcoded hex in components)
- Framer Motion for onboarding transitions, card hovers, page fades
- Zod validation on all server function inputs

## What ships when you approve

Phase 1 end-to-end: landing, auth, onboarding wizard, AI-personalized dashboard, and AI chat — a working product you can use immediately. Then I'll proceed through Phases 2–4 in follow-up turns, checking with you before Stripe/Resend since those need your accounts.

## Open questions before I build

1. **Accent color**: warm gold (#D4A574-ish), deep teal, or something else?
2. **Phase 1 only, or full plan through Phase 4** in this session (Phases 2–3 are safe to auto-continue; 4 needs your Stripe/Resend keys)?
