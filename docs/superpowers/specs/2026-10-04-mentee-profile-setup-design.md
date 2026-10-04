# Mentee Profile Setup (Onboarding) — Design

**Date:** 2026-10-04
**Status:** Approved (pending spec review)
**Roadmap item:** Launch — "A new mentee account goes to a profile setup page before the rest of the app: interests, career goals, subscription tier."

## Goal

After signing up, a mentee must complete a one-page onboarding before using the
rest of the app: pick **interests** (predefined categories + custom), list
**career goals** (free text), and choose a **plan**. Choosing Free activates a
free subscription immediately; choosing a paid tier sends them to checkout
(stub-ready until real Stripe price IDs exist). The interests/goals feed the
future matching feature.

## Scope / decisions

- Onboarding is **mandatory** (no skip) and applies to the **mentee role only**.
  Mentors/admins are never gated by it.
- Existing mentees (flag defaults false) also pass through onboarding once.
- Stripe: Free activates now; paid tiers use the existing
  `/api/subscriptions/checkout` route — which works once price IDs/keys are
  configured, and until then the user still finishes onboarding and lands on the
  subscription page with a "payment setup pending" note. Onboarding completion
  NEVER depends on payment succeeding (a mentee can't get stuck).
- **Out of scope:** Stripe Connect / Express "account links" (that is mentor
  payouts, a separate future feature); the matching algorithm itself; editing
  interests/goals after onboarding (the existing profile page can gain that
  later).

## Data model (migration, applied via Management API)

Add to `public.user_profiles`:
- `interests text[]` — selected category labels + custom strings.
- `career_goals text[]` — free-text goals.
- `onboarding_completed boolean not null default false`.

No RLS change: the existing "users update/select own profile" policies cover
these columns. The onboarding API writes with the service role anyway.

## Components

### 1. `src/lib/onboarding.ts` (pure + wrapper)
- Pure, unit-tested: `needsOnboarding(role: string, onboardingCompleted: boolean): boolean`
  → `true` only when `role === 'mentee' && onboardingCompleted === false`.
- `src/lib/onboarding-options.ts`: exported `INTEREST_CATEGORIES: string[]` (the
  proposed list) so the page and validation share one source.

### 2. Onboarding gate
The existing `src/app/dashboard/layout.tsx` is a **client** component (it only
does a client-side login check), so the gate is a NEW **server** layout:
`src/app/dashboard/mentee/layout.tsx`. It nests under the client dashboard
layout (a server component as a client component's child is fine), reads the
current user's `role` + `onboarding_completed` via the server Supabase client,
and `redirect('/dashboard/onboarding')` when `needsOnboarding(...)`. This covers
every `/dashboard/mentee/*` page. Fail-safe: only redirect on a definitive
`onboarding_completed === false`; on a read error, render children (don't trap).

The onboarding page lives at `/dashboard/onboarding` — **outside** the mentee
layout — so the gate never redirects onto itself (no loop). `/dashboard/messages`
is shared (mentors too) and is already covered for un-onboarded mentees by the
paid-access gate (no subscription → locked), so it does not need a separate
onboarding check.

### 3. Onboarding page `src/app/dashboard/onboarding/page.tsx` (+ client form `OnboardingForm.tsx`, `.module.css`)
The page (server) redirects to `/dashboard` if the user is not a mentee or is
already onboarded; otherwise it renders the client form.
One page, three sections:
- **Interests** — chips from `INTEREST_CATEGORIES` (toggle) + an "add your own"
  text input that appends custom chips. At least 1 required.
- **Career goals** — free-text list input (type + Enter adds a chip; removable).
  At least 1 required.
- **Plan** — the plan cards from `GET /api/subscriptions/plans` (Free / Growth /
  Premium), single-select.
Submit button posts to the API; shows inline validation + a saving state.

### 4. Submit API `POST /api/mentee/onboarding`
Auth required; must be a mentee. Body (zod): `{ interests: string[] (>=1), careerGoals: string[] (>=1), planId: string (uuid) }`.
Steps (service role):
1. Update `user_profiles`: `interests`, `career_goals`, `onboarding_completed = true`.
2. Look up the chosen plan. If `monthly_price === 0` (Free): upsert an
   `is_current`, `status='active'` subscription on that plan for the user
   (mark any prior current sub not-current first). Return `{ redirect: '/dashboard/mentee' }`.
3. If paid: if the plan has a `stripe_price_id` and Stripe is configured, create
   a checkout session (reuse the checkout route's logic) and return
   `{ redirect: <stripe url> }`. Otherwise return
   `{ redirect: '/dashboard/mentee/subscription?pending=1' }` (onboarding is
   already marked complete).
On any failure after step 1, still return a safe redirect to the subscription
page; never 500 the user into a dead end.

### 5. Interaction with paid-access gating (already shipped)
Finishing onboarding ≠ paid access. Free / payment-pending mentees are onboarded
but still see the locked panels on chat/resources/sessions until they're on an
active paid plan. Consistent by design — no change needed to the gating code.

## Predefined interest categories

Entrepreneurship, Leadership, Technology & STEM, Finance, Marketing & Branding,
Healthcare, Education, Creative Arts, Nonprofit & Social Impact, Career
Transition, Public Speaking, Work–Life Balance.

## Data flow

```
signup ─► user_profiles{role:mentee, onboarding_completed:false}
mentee opens any /dashboard/mentee/* ─► mentee layout (server): needsOnboarding? ─► redirect /dashboard/onboarding
onboarding submit ─► POST /api/mentee/onboarding ─► save fields + onboarding_completed=true
                      ├─ Free  ─► create active Free sub ─► /dashboard/mentee
                      └─ Paid  ─► checkout url (if price id) | /dashboard/mentee/subscription?pending=1
```

## Error handling

- API validates with zod; returns 400 with the first message on bad input, 401
  unauthed, 403 for non-mentees.
- Gate fails safe (read error → let through, don't loop).
- Paid path with no price id → finish onboarding, route to subscription page
  with a pending note; no 500.

## Testing

- **Unit:** `needsOnboarding(role, completed)` truth table (mentee+false → true;
  mentee+true → false; mentor/admin → false regardless). A pure
  `tierDecision(plan)` helper → `'free' | 'paid'` for the submit branch.
- **Manual (live DB):** a fresh mentee is redirected to onboarding; submitting
  with Free creates an active Free sub + lands on the dashboard and can't re-enter
  onboarding; submitting with a paid tier (no price id) completes onboarding and
  lands on the subscription page with the pending note; mentors/admins never see
  onboarding. Verify saved `interests`/`career_goals` arrays via the Management API.
