# ForMe

**One profile. Personalised global opportunities. Clear next steps.**

🌍 **Live demo:** https://forme-opportunity-discovery.lovable.app

ForMe is a profile-led opportunity discovery platform designed to help people explore international pathways without researching every country from scratch.

Instead of starting with *“Where do you want to go?”*, ForMe starts with the person — their education, experience, profession, goals and countries of interest — then turns that information into relevant opportunities, eligibility guidance and a clear next action.

> ForMe is a discovery and guidance product, not an immigration agency or legal-advice service.

## The problem

International opportunity research is fragmented. People often move between government websites, job boards, university pages, scholarship portals and social media while trying to answer three simple questions:

- Which opportunities actually fit my profile?
- Why are they relevant to me?
- What should I do next?

ForMe is designed around reducing that uncertainty.

## What the product does

### 1. Build one profile
Users share core information such as:

- country of residence and nationality
- education
- profession
- primary goal
- countries of interest

### 2. Discover relevant opportunities
ForMe uses the profile to surface international pathways across areas such as:

- permanent residence
- employer-sponsored work
- study
- scholarships

### 3. Understand why an opportunity fits
Recommendations are paired with context so users can understand why a route may be relevant rather than seeing an unexplained result.

### 4. Personalise the route
Each opportunity can ask additional eligibility questions while avoiding information the user has already provided.

### 5. Turn research into action
Users can see:

- their active journey
- current step
- next action
- progress milestones
- saved and recommended opportunities
- archived opportunities
- confidence indicators and supporting guidance

## Product principles

ForMe was designed around a few simple principles:

- **Profile first:** start with the user rather than a destination.
- **Explain the match:** recommendations should be understandable.
- **One next action:** reduce overwhelming checklists.
- **Progress over browsing:** help users move from discovery to execution.
- **Reuse what we already know:** do not repeatedly ask users for the same information.

## Current experience

The current product includes:

- responsive marketing landing page
- guided onboarding
- personalised results
- route-specific follow-up questions
- eligibility summaries
- journey and milestone tracking
- personalised dashboard (“My World”)
- email, Google and Apple authentication
- persistent user profiles
- Supabase-backed data storage
- responsive UI and motion interactions

## Tech stack

- **React 19**
- **TypeScript**
- **TanStack Router / TanStack Start**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui + Radix UI**
- **Framer Motion**
- **Supabase**
- **React Query**
- **Zod**

## Security

The application uses Supabase authentication and Row Level Security (RLS) on its user-facing database tables so authenticated users can only access data permitted by the relevant policies.

Client-side Supabase configuration uses a publishable/anonymous key. No Supabase service-role key is stored in this repository.

## Local development

### Prerequisites

- Node.js
- npm

### Setup

```bash
git clone https://github.com/alfonsooluwapelumi199x-prog/wisdom-weave-workshop.git
cd wisdom-weave-workshop
npm install
npm run dev
```

Create a local `.env` file with the required Supabase client configuration:

```env
SUPABASE_PROJECT_ID=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
```

## Product status

ForMe is an evolving product prototype. The current version focuses on the profile-to-opportunity-to-next-action journey.

Future development can extend the product with:

- additional country-specific pathway logic
- live opportunity and programme data
- deeper eligibility calculations
- notification and deadline tracking
- richer saved-opportunity workflows
- improved recommendation explainability

## Built with Lovable

The project is developed in Lovable and synced with GitHub.

Changes committed to the connected `main` branch remain part of the Lovable/GitHub workflow.

---

**ForMe — Find the opportunities made for you.**
