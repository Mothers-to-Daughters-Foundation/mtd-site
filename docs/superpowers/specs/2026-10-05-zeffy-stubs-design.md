# Replace Stripe with Zeffy (Stubbed) — Design

**Date:** 2026-10-05
**Status:** Approved for planning

## Goal

Remove Stripe entirely. Mentees subscribe through per-tier Zeffy hosted payment
links. A subscription becomes `active` via a secret-guarded stub webhook
(ready for a later Zeffy→Zapier automation) and via an admin manual-activation
control. The paid-access gate is unchanged — it reads the `subscriptions` table
(`getMenteeAccess`), so only *how* a subscription becomes active changes.

## Architecture

A single canonical activation function does the work the Stripe webhook used to
do; both the stub webhook and the admin control call it. Checkout returns the
tier's Zeffy link instead of creating a Stripe Checkout session. All Stripe
code, the npm dependency, env vars, and the two Stripe DB columns are removed.

## Components

### 1. Shared activation path (DRY)

`activateSubscription({ userId, planId, billingCycle })` in
`src/lib/supabase/subscriptions.ts`, using the admin (service-role) client:

- Validate the plan exists and is active.
- Compute `expires_at` with a pure helper `computeExpiry(startedAt, billingCycle)`:
  `'yearly'` → +1 year, anything else (`'monthly'`/undefined) → +1 month.
- Upsert the user's current subscription: set `status = 'active'`,
  `is_current = true`, `started_at = now`, `expires_at`, `cancelled_at = null`,
  `auto_renew = true`, `plan_id`.
- Deactivate the user's other `is_current` rows (`is_current = false`).
- Fire-and-forget `autoMatchMentee(userId)` (never throws; matches the prior
  Stripe-webhook behavior).

Returns `{ ok: boolean; error?: string }`.

`computeExpiry` is pure and unit-tested (monthly → +1 month, yearly → +1 year,
leap-safe via `Date` month/year arithmetic).

### 2. Stub webhook — `POST /api/webhooks/zeffy`

- Guarded by a `ZEFFY_WEBHOOK_SECRET` request header; mismatch → 401.
- Body: `{ userId?: string; email?: string; planId: string; billingCycle?: 'monthly' | 'yearly' }`.
  One of `userId`/`email` is required → else 400.
- Resolve the user (by id, or by email via `user_profiles`); not found → 404.
- Call `activateSubscription`; on its error → 500, else `{ received: true }`.
- This is the drop-in point for a real Zeffy→Zapier automation; no Zeffy
  SDK/API is used.

### 3. Checkout — `POST /api/subscriptions/checkout`

- Keep auth + plan lookup. Remove ALL Stripe code.
- Return `{ provider: 'zeffy', zeffyUrl: plan.zeffy_url }`.
- If the plan has no `zeffy_url` → 400 ("This plan has no Zeffy link configured.").
- No DB write here; activation is the webhook's / admin's responsibility. The
  subscription page already handles a `zeffyUrl` response (opens it in a new tab).

### 4. Admin manual activation — `/dashboard/admin/subscriptions`

- **Fix the crash first.** The page currently throws. Diagnose the real root
  cause (systematic-debugging) before changing behavior — likely the PostgREST
  FK-embed alias in `getAllSubscriptions` (`subscriptions_user_fkey` /
  `subscriptions_plan_fkey`) not matching the live constraint names, or a null
  returned to `subscriptions.length`. Confirm constraint names via
  `node scripts/apply-sql.mjs "select conname from pg_constraint where conrelid = 'public.subscriptions'::regclass and contype = 'f';"`.
- Add per-user controls (server action, admin-guarded): **Activate** (choose a
  plan + billing cycle → `activateSubscription`) and **Cancel** (mark `cancelled`,
  `is_current = false`).

### 5. Cancel — `POST /api/subscriptions/cancel`

- Remove the Stripe `subscriptions.cancel(...)` call and the Stripe import.
- DB-only: mark the current subscription `cancelled`, `cancelled_at = now`,
  `is_current = false`.

### 6. Full Stripe removal

- Delete `src/lib/stripe.ts` and `src/app/api/webhooks/stripe/route.ts`.
- Remove `stripe` from `package.json` dependencies (and lockfile).
- Remove `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from
  `.env.local.example`; add `ZEFFY_WEBHOOK_SECRET`.
- Migration **0011**: `alter table public.plans drop column if exists stripe_price_id;`
  and `alter table public.subscriptions drop column if exists stripe_subscription_id;`
  (applied live via `node scripts/apply-sql.mjs`).
- Remove `stripe_price_id` from the `Plan` model (`src/lib/supabase/plans.ts`) and
  `stripe_subscription_id` from the `Subscription` model
  (`src/lib/supabase/subscriptions.ts`), plus all references.
- `TierEditor` (`src/components/dashboard/TierEditor.tsx`): remove the "Stripe
  Price ID" field and `stripePriceId` from its form/type; keep the Zeffy URL
  field, relabel it "Zeffy payment link". Update the tiers API handler to stop
  reading/writing `stripePriceId` / `stripe_price_id`.

## Data Flow

1. Admin sets each tier's Zeffy payment link in the tier editor.
2. Mentee clicks Subscribe → checkout returns the tier's `zeffyUrl` → mentee
   pays on Zeffy's hosted form (new tab).
3. Activation: either a Zeffy→Zapier automation POSTs `/api/webhooks/zeffy` with
   the secret, or an admin activates the mentee on the Subscriptions page. Both
   call `activateSubscription`, which marks the row active and triggers
   auto-matching.
4. The paid-access gate (`getMenteeAccess`) sees the active, unexpired row and
   unlocks chat/resources/sessions — unchanged.

## Error Handling

- Webhook: 401 (bad secret), 400 (missing user identifier/planId), 404 (unknown
  user/plan), 500 (activation failure). Never leaks the secret.
- Checkout: 400 when the plan has no Zeffy link.
- `activateSubscription`: returns `{ ok: false, error }` on any Supabase failure;
  callers surface it.
- Admin page: must render without throwing even when there are zero
  subscriptions or a joined profile/plan is null.

## Testing

- Unit tests (vitest) on the pure `computeExpiry`: monthly → +1 month,
  yearly → +1 year, and a month-end/leap case (e.g. Jan 31 → Feb 28/29).
- Webhook, `activateSubscription`, admin action, checkout, and cancel are
  verified by the per-task and whole-branch reviews, consistent with prior
  features (no server-side integration-test harness exists).

## Out of Scope

- A real Zeffy API/SDK integration — Zeffy exposes no robust server API/webhook,
  which is why activation is stubbed.
- Donation-page changes — `/donate` already embeds the Zeffy iframe.
