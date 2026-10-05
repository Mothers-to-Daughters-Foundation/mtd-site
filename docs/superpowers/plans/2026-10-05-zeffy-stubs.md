# Replace Stripe with Zeffy Stubs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Stripe entirely; mentees subscribe via per-tier Zeffy links, and subscriptions are marked active by a secret-guarded stub webhook and an admin manual-activation control.

**Architecture:** One canonical `activateSubscription` function (used by both the stub webhook and the admin control) does what the Stripe webhook used to do: upsert an active, current subscription, set expiry, deactivate older rows, and trigger auto-matching. Checkout returns the tier's Zeffy link instead of a Stripe session. All Stripe code, the npm dependency, env vars, and the two Stripe DB columns are deleted.

**Tech Stack:** Next.js 14 App Router (route handlers + server actions), TypeScript, Supabase (`@supabase/ssr` server client, service-role admin client), zod, vitest.

## Global Constraints

- The paid-access gate (`getMenteeAccess`, reading `subscriptions`) is NOT changed — only how a subscription becomes active changes.
- A subscription becomes active ONLY via `activateSubscription`, called by: the stub webhook `/api/webhooks/zeffy` (guarded by the `x-zeffy-secret` header matching `process.env.ZEFFY_WEBHOOK_SECRET`) and the admin Subscriptions page.
- `subscriptions.status` enum values are exactly: `'active' | 'trial' | 'expired' | 'paused' | 'cancelled'`. There is no "pending" status; checkout does NOT write to the DB.
- Migrations are applied live via `node scripts/apply-sql.mjs <file.sql>` (reads `SUPABASE_ACCESS_TOKEN` from `.env.local`). Never print the token.
- "Not using Stripe at all": no `stripe` import, dependency, env var, route, or DB column may remain after this plan.
- Confirmed fact (do not re-investigate as a cause): the `subscriptions` FK constraint names are `subscriptions_plan_fkey` (→ plans) and `subscriptions_user_fkey` (→ user_profiles). The PostgREST embeds in `getAllSubscriptions` already use these correct names.
- Use `tsc --noEmit` for type checks during tasks; only run `next build` after stopping any live dev server (a build clobbers it).

---

### Task 1: Migration — drop Stripe columns

**Files:**
- Create: `supabase/migrations/0011_drop_stripe_columns.sql`

**Interfaces:**
- Produces: `plans` no longer has `stripe_price_id`; `subscriptions` no longer has `stripe_subscription_id`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0011_drop_stripe_columns.sql`:

```sql
-- Remove Stripe columns; the app uses Zeffy links + a stub activation webhook.
alter table public.plans drop column if exists stripe_price_id;
alter table public.subscriptions drop column if exists stripe_subscription_id;
```

- [ ] **Step 2: Apply it live**

Run: `node scripts/apply-sql.mjs supabase/migrations/0011_drop_stripe_columns.sql`
Expected: a JSON array response (no `HTTP 4xx/5xx`).

- [ ] **Step 3: Verify the columns are gone**

Run: `node scripts/apply-sql.mjs "select table_name, column_name from information_schema.columns where (table_name='plans' and column_name='stripe_price_id') or (table_name='subscriptions' and column_name='stripe_subscription_id');"`
Expected: `[]` (empty — neither column exists).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0011_drop_stripe_columns.sql
git commit -m "Drop Stripe columns from plans and subscriptions"
```

---

### Task 2: Pure subscription-expiry logic + tests

**Files:**
- Create: `src/lib/subscription-expiry.ts`
- Test: `src/lib/subscription-expiry.test.ts`

**Interfaces:**
- Produces: `computeExpiry(startedAt: Date, billingCycle: 'monthly' | 'yearly'): string` — returns an ISO timestamp one month (or one year) after `startedAt`, clamping day overflow to the last day of the target month. Uses UTC arithmetic.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/subscription-expiry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeExpiry } from './subscription-expiry';

describe('computeExpiry', () => {
  it('monthly adds one month', () => {
    expect(computeExpiry(new Date('2026-01-15T00:00:00.000Z'), 'monthly')).toBe(
      '2026-02-15T00:00:00.000Z'
    );
  });

  it('yearly adds one year', () => {
    expect(computeExpiry(new Date('2026-01-15T00:00:00.000Z'), 'yearly')).toBe(
      '2027-01-15T00:00:00.000Z'
    );
  });

  it('monthly clamps day overflow (Jan 31 -> Feb 28 in a non-leap year)', () => {
    expect(computeExpiry(new Date('2026-01-31T00:00:00.000Z'), 'monthly')).toBe(
      '2026-02-28T00:00:00.000Z'
    );
  });

  it('yearly clamps a leap day (Feb 29 2024 -> Feb 28 2025)', () => {
    expect(computeExpiry(new Date('2024-02-29T00:00:00.000Z'), 'yearly')).toBe(
      '2025-02-28T00:00:00.000Z'
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/subscription-expiry.test.ts`
Expected: FAIL — cannot resolve `./subscription-expiry`.

- [ ] **Step 3: Implement the module**

Create `src/lib/subscription-expiry.ts`:

```ts
export function computeExpiry(
  startedAt: Date,
  billingCycle: 'monthly' | 'yearly'
): string {
  const d = new Date(startedAt.getTime());
  const day = d.getUTCDate();

  if (billingCycle === 'yearly') {
    d.setUTCFullYear(d.getUTCFullYear() + 1);
  } else {
    d.setUTCMonth(d.getUTCMonth() + 1);
  }

  // If the day rolled over into the following month (e.g. Jan 31 -> Mar 3),
  // clamp back to the last day of the intended month.
  if (d.getUTCDate() < day) {
    d.setUTCDate(0);
  }

  return d.toISOString();
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/subscription-expiry.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/subscription-expiry.ts src/lib/subscription-expiry.test.ts
git commit -m "Add pure computeExpiry helper with tests"
```

---

### Task 3: `activateSubscription` shared helper

**Files:**
- Modify: `src/lib/supabase/subscriptions.ts`

**Interfaces:**
- Consumes: `computeExpiry` from `@/lib/subscription-expiry`; `createAdminClient` from `./admin` (already imported); `autoMatchMentee` from `@/lib/matching-service`.
- Produces: `activateSubscription(input: { userId: string; planId: string; billingCycle?: 'monthly' | 'yearly' }): Promise<{ ok: boolean; error?: string }>`. Also: the `Subscription` interface no longer has `stripe_subscription_id`.

- [ ] **Step 1: Remove the Stripe field from the model**

In `src/lib/supabase/subscriptions.ts`, delete this line from the `Subscription` interface:

```ts
  stripe_subscription_id: string | null;
```

- [ ] **Step 2: Add imports at the top of the file**

Add after the existing imports (`createClient`, `createAdminClient`):

```ts
import { computeExpiry } from "@/lib/subscription-expiry";
import { autoMatchMentee } from "@/lib/matching-service";
```

- [ ] **Step 3: Add the `activateSubscription` function**

Append to `src/lib/supabase/subscriptions.ts`:

```ts
/**
 * Canonical "mark a mentee's subscription active" path. Used by the Zeffy stub
 * webhook and by the admin manual-activation control. Upserts the user's
 * current subscription as active, deactivates any older current rows, and
 * triggers auto-matching. Never throws — returns { ok, error? }.
 */
export async function activateSubscription(input: {
  userId: string;
  planId: string;
  billingCycle?: "monthly" | "yearly";
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const cycle = input.billingCycle ?? "monthly";

    const { data: plan } = await admin
      .from("plans")
      .select("id, is_active")
      .eq("id", input.planId)
      .maybeSingle();
    if (!plan || !plan.is_active) {
      return { ok: false, error: "Plan not found or inactive." };
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = computeExpiry(now, cycle);

    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", input.userId)
      .eq("is_current", true)
      .maybeSingle();

    const fields = {
      user_id: input.userId,
      plan_id: input.planId,
      status: "active" as const,
      billing_cycle: cycle,
      expires_at: expiresAt,
      cancelled_at: null,
      auto_renew: true,
      is_current: true,
      updated_at: nowIso,
    };

    let currentId: string;
    if (existing?.id) {
      const { data: updated, error } = await admin
        .from("subscriptions")
        .update(fields)
        .eq("id", existing.id)
        .select("id")
        .single();
      if (error || !updated) {
        return { ok: false, error: error?.message ?? "Update failed." };
      }
      currentId = updated.id;
    } else {
      const { data: inserted, error } = await admin
        .from("subscriptions")
        .insert({ ...fields, started_at: nowIso })
        .select("id")
        .single();
      if (error || !inserted) {
        return { ok: false, error: error?.message ?? "Insert failed." };
      }
      currentId = inserted.id;
    }

    const { error: deactivateError } = await admin
      .from("subscriptions")
      .update({ is_current: false })
      .eq("user_id", input.userId)
      .neq("id", currentId)
      .eq("is_current", true);
    if (deactivateError) {
      return { ok: false, error: deactivateError.message };
    }

    void autoMatchMentee(input.userId).catch((e) =>
      console.error("[activateSubscription auto-match]", e)
    );

    return { ok: true };
  } catch (error) {
    console.error("[activateSubscription]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Activation failed.",
    };
  }
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (Removing `stripe_subscription_id` may surface references in the Stripe webhook — that file is deleted in Task 8; if tsc flags it now, leave it for Task 8. If tsc errors ONLY in `src/app/api/webhooks/stripe/route.ts` or `src/app/api/subscriptions/cancel/route.ts`, note it in the report; those are addressed in Tasks 5 and 8.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/subscriptions.ts
git commit -m "Add activateSubscription shared helper; drop stripe_subscription_id from model"
```

---

### Task 4: Zeffy stub webhook

**Files:**
- Create: `src/app/api/webhooks/zeffy/route.ts`

**Interfaces:**
- Consumes: `activateSubscription` from `@/lib/supabase/subscriptions`; `createAdminClient` from `@/lib/supabase/admin`.
- Produces: `POST /api/webhooks/zeffy`.

- [ ] **Step 1: Create the route**

Create `src/app/api/webhooks/zeffy/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateSubscription } from "@/lib/supabase/subscriptions";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    userId: z.string().uuid().optional(),
    email: z.string().email().optional(),
    planId: z.string().uuid(),
    billingCycle: z.enum(["monthly", "yearly"]).optional(),
  })
  .refine((b) => b.userId || b.email, {
    message: "Either userId or email is required.",
  });

export async function POST(req: NextRequest) {
  const secret = process.env.ZEFFY_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-zeffy-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  let userId = parsed.data.userId ?? null;
  if (!userId && parsed.data.email) {
    const { data: profile } = await admin
      .from("user_profiles")
      .select("id")
      .eq("email", parsed.data.email)
      .maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    userId = profile.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await activateSubscription({
    userId,
    planId: parsed.data.planId,
    billingCycle: parsed.data.billingCycle,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors in this file (pre-existing Stripe-file errors from Task 3's note are fine until Tasks 5/8).

- [ ] **Step 3: Verify unauthorized is rejected**

With the dev server running, run:
`curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/webhooks/zeffy -H "Content-Type: application/json" -d '{"planId":"00000000-0000-0000-0000-000000000000"}'`
Expected: `401` (no/!matching secret header).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/zeffy/route.ts
git commit -m "Add Zeffy stub activation webhook (secret-guarded)"
```

---

### Task 5: De-Stripe checkout and cancel routes

**Files:**
- Modify: `src/app/api/subscriptions/checkout/route.ts`
- Modify: `src/app/api/subscriptions/cancel/route.ts`

**Interfaces:**
- Consumes: existing `getPlanById` (returns a `Plan` with `zeffy_url: string | null`), `getSubscriptionByUserId`, `updateSubscription`.
- Produces: checkout returns `{ provider: 'zeffy', zeffyUrl: string }`; cancel is DB-only.

- [ ] **Step 1: Rewrite the checkout route**

Replace the entire contents of `src/app/api/subscriptions/checkout/route.ts` with:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/supabase/plans";
import { z } from "zod";

const checkoutSchema = z.object({
  tierId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const plan = await getPlanById(parsed.data.tierId);
    if (!plan || !plan.is_active) {
      return NextResponse.json(
        { error: "Plan not found or inactive" },
        { status: 404 }
      );
    }

    if (!plan.zeffy_url) {
      return NextResponse.json(
        { error: "This plan has no Zeffy link configured. An admin must set its Zeffy payment link." },
        { status: 400 }
      );
    }

    return NextResponse.json({ provider: "zeffy", zeffyUrl: plan.zeffy_url });
  } catch (error) {
    console.error("[subscriptions/checkout POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Rewrite the cancel route (DB-only)**

Replace the entire contents of `src/app/api/subscriptions/cancel/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_current", true)
      .maybeSingle();

    if (error) throw error;

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        is_current: false,
      })
      .eq("id", subscription.id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("[subscriptions/cancel POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors from these two files (they no longer import Stripe). The only remaining Stripe references now live in `src/lib/stripe.ts` and `src/app/api/webhooks/stripe/route.ts`, both deleted in Task 8.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/subscriptions/checkout/route.ts src/app/api/subscriptions/cancel/route.ts
git commit -m "De-Stripe checkout (return Zeffy link) and cancel (DB-only)"
```

---

### Task 6: Persist Zeffy URL in the tier editor; drop the Stripe field

**Files:**
- Modify: `src/lib/supabase/plans.ts`
- Modify: `src/app/api/admin/tiers/route.ts`
- Modify: `src/app/api/admin/tiers/[id]/route.ts`
- Modify: `src/components/dashboard/TierEditor.tsx`

**Interfaces:**
- Produces: admins can set a plan's `zeffy_url` via the tier editor; the `Plan` model no longer has `stripe_price_id`.

- [ ] **Step 1: Update the `Plan` model + `updatePlan` mapping**

In `src/lib/supabase/plans.ts`:

Remove this line from the `Plan` interface:

```ts
  stripe_price_id: string |null;
```

In `updatePlan`, widen the `updates` type and map `zeffyUrl`. Change the signature's `Partial<{...}>` to include `zeffyUrl?: string`:

```ts
  updates: Partial<{
    name: string;
    slug: string;
    description: string;
    pricePerMonth: number;
    isActive: boolean;
    maxMentees: number;
    zeffyUrl: string;
  }>
```

and add this mapping alongside the others (before the `.update(dbUpdates)` call):

```ts
  if (updates.zeffyUrl !== undefined)
    dbUpdates.zeffy_url = updates.zeffyUrl;
```

- [ ] **Step 2: Accept `zeffy_url` on create**

In `src/app/api/admin/tiers/route.ts`, add to `createPlanSchema`:

```ts
  zeffy_url: z.string().optional(),
```

(The handler already inserts `parsed.data`, so the column will be written.)

- [ ] **Step 3: Accept `zeffyUrl` on update**

In `src/app/api/admin/tiers/[id]/route.ts`, add to `updatePlanSchema`:

```ts
  zeffyUrl: z.string().optional(),
```

- [ ] **Step 4: Remove the Stripe Price ID field from the tier editor**

In `src/components/dashboard/TierEditor.tsx`:

Remove `stripePriceId?: string;` from the `Tier` interface. Remove `stripePriceId: '',` from `emptyForm()`. Remove `stripePriceId: tier.stripePriceId ?? '',` from `openEdit`. Replace the two-field row containing the Stripe Price ID input (the `<div className={styles.row}>` block holding the "Stripe Price ID" and "Zeffy URL (optional)" fields) with a single Zeffy field:

```tsx
              <div className={styles.field}>
                <label>Zeffy payment link</label>
                <input
                  name="zeffyUrl"
                  value={form.zeffyUrl}
                  onChange={handleChange}
                  placeholder="https://www.zeffy.com/…"
                />
              </div>
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors in these four files.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/plans.ts src/app/api/admin/tiers/route.ts "src/app/api/admin/tiers/[id]/route.ts" src/components/dashboard/TierEditor.tsx
git commit -m "Persist plan Zeffy link via tier editor; remove Stripe price ID field"
```

---

### Task 7: Fix the admin Subscriptions page and add manual activate/cancel

**Files:**
- Modify: `src/lib/supabase/subscriptions.ts` (harden `getAllSubscriptions`)
- Create: `src/app/dashboard/admin/subscriptions/actions.ts`
- Create: `src/app/dashboard/admin/subscriptions/SubscriptionsManager.tsx`
- Modify: `src/app/dashboard/admin/subscriptions/page.tsx`

**Interfaces:**
- Consumes: `activateSubscription` (Task 3); `getAllSubscriptions`; `getAllPlans` from `@/lib/supabase/plans`.
- Produces: a working admin Subscriptions page with per-user Activate (plan + billing cycle) and Cancel controls.

- [ ] **Step 1: Diagnose the crash (systematic-debugging — root cause before fix)**

With the dev server running, open `/dashboard/admin/subscriptions` as an admin (or read the dev-server error output for that route) and capture the actual error/stack. Do NOT guess. Note: the FK embed aliases (`subscriptions_plan_fkey`, `subscriptions_user_fkey`) are already correct (confirmed against the live schema), so the cause is NOT a wrong alias. The likely cause is `getAllSubscriptions` returning `null` (PostgREST returns `data: null` in some cases) which then crashes `subscriptions.length`/`.map` in the page, and/or an unguarded null in the embedded `plans`/`user_profiles`. Record the observed error in the report.

- [ ] **Step 2: Harden `getAllSubscriptions`**

In `src/lib/supabase/subscriptions.ts`, change the final `return data;` of `getAllSubscriptions` to:

```ts
  return data ?? [];
```

- [ ] **Step 3: Add admin server actions**

Create `src/app/dashboard/admin/subscriptions/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateSubscription } from "@/lib/supabase/subscriptions";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

export async function adminActivateSubscription(input: {
  userId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
}): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const result = await activateSubscription(input);
  if (result.ok) revalidatePath("/dashboard/admin/subscriptions");
  return result;
}

export async function adminCancelSubscription(
  subscriptionId: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const client = createAdminClient();
  const { error } = await client
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      is_current: false,
    })
    .eq("id", subscriptionId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/admin/subscriptions");
  return { ok: true };
}
```

- [ ] **Step 4: Create the client manager component**

Create `src/app/dashboard/admin/subscriptions/SubscriptionsManager.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminActivateSubscription,
  adminCancelSubscription,
} from "./actions";

export type SubRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  planName: string | null;
  billingCycle: string | null;
  status: string;
  expiresAt: string | null;
  startedAt: string | null;
};

export type PlanOption = { id: string; name: string };

export default function SubscriptionsManager({
  subscriptions,
  plans,
}: {
  subscriptions: SubRow[];
  plans: PlanOption[];
}) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function activate(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!userId.trim() || !planId) {
      setMsg("A user ID and plan are required.");
      return;
    }
    setBusy(true);
    const res = await adminActivateSubscription({
      userId: userId.trim(),
      planId,
      billingCycle,
    });
    setBusy(false);
    if (!res.ok) setMsg(res.error ?? "Activation failed.");
    else {
      setMsg("Subscription activated.");
      setUserId("");
      router.refresh();
    }
  }

  async function cancel(id: string) {
    setBusy(true);
    const res = await adminCancelSubscription(id);
    setBusy(false);
    if (!res.ok) setMsg(res.error ?? "Cancel failed.");
    else router.refresh();
  }

  return (
    <div>
      {msg && (
        <div role="status" style={{ margin: "0.5rem 0" }}>
          {msg}
        </div>
      )}

      <form
        onSubmit={activate}
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "end",
          margin: "1rem 0",
          padding: "1rem",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span>User ID</span>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="mentee user UUID"
            style={{ minWidth: 300 }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span>Plan</span>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span>Billing</span>
          <select
            value={billingCycle}
            onChange={(e) =>
              setBillingCycle(e.target.value as "monthly" | "yearly")
            }
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
        <button type="submit" disabled={busy}>
          Activate
        </button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Renewal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.length === 0 ? (
            <tr>
              <td colSpan={5}>No subscriptions yet.</td>
            </tr>
          ) : (
            subscriptions.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                <td>
                  <div>{s.userName ?? "—"}</div>
                  <div style={{ fontSize: "0.85em", opacity: 0.7 }}>
                    {s.userEmail ?? s.userId}
                  </div>
                </td>
                <td>{s.planName ?? "—"}</td>
                <td>{s.status}</td>
                <td>
                  {s.expiresAt
                    ? new Date(s.expiresAt).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  {s.status !== "cancelled" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => cancel(s.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Rewrite the page to use the manager**

Replace the entire contents of `src/app/dashboard/admin/subscriptions/page.tsx` with:

```tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllSubscriptions } from "@/lib/supabase/subscriptions";
import { getAllPlans } from "@/lib/supabase/plans";
import SubscriptionsManager, {
  type SubRow,
  type PlanOption,
} from "./SubscriptionsManager";

import styles from "./page.module.css";

export const metadata = { title: "Subscriptions | Admin" };

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const [subscriptions, plans] = await Promise.all([
    getAllSubscriptions(),
    getAllPlans(),
  ]);

  const rows: SubRow[] = (subscriptions ?? []).map((sub: any) => ({
    id: sub.id,
    userId: sub.user_id,
    userName: sub.user_profiles?.full_name ?? null,
    userEmail: sub.user_profiles?.email ?? null,
    planName: sub.plans?.name ?? null,
    billingCycle: sub.billing_cycle ?? null,
    status: sub.status,
    expiresAt: sub.expires_at ?? null,
    startedAt: sub.started_at ?? null,
  }));

  const planOptions: PlanOption[] = plans.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Subscriptions</h1>
        <p className={styles.subtitle}>{rows.length} total subscription records</p>
      </div>
      <SubscriptionsManager subscriptions={rows} plans={planOptions} />
    </div>
  );
}
```

- [ ] **Step 6: Type-check and verify the page renders**

Run: `npx tsc --noEmit` (expected: clean).
With the dev server running, load `/dashboard/admin/subscriptions` as an admin and confirm it renders without the previous crash (the activate form + the table appear). Record the before/after in the report.

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase/subscriptions.ts src/app/dashboard/admin/subscriptions/
git commit -m "Fix admin Subscriptions page crash; add manual activate/cancel controls"
```

---

### Task 8: Remove all remaining Stripe code, dependency, and env

**Files:**
- Delete: `src/lib/stripe.ts`
- Delete: `src/app/api/webhooks/stripe/route.ts`
- Modify: `package.json`
- Modify: `.env.local.example`

**Interfaces:**
- Produces: zero Stripe references remain in the tree; `ZEFFY_WEBHOOK_SECRET` documented.

- [ ] **Step 1: Delete the Stripe files**

```bash
git rm src/lib/stripe.ts src/app/api/webhooks/stripe/route.ts
```

- [ ] **Step 2: Remove the `stripe` dependency**

In `package.json`, delete the `"stripe": "..."` line from `dependencies`. Then run:

```bash
npm install
```

(so `package-lock.json` is updated and `node_modules/stripe` is pruned).

- [ ] **Step 3: Update `.env.local.example`**

In `.env.local.example`, replace the Stripe block:

```
# ── Stripe (only needed to demo payments/checkout) ──────────────────────
# Use TEST keys for local demos. Leave as-is to skip payments — the rest of
# the app works; only checkout/webhook routes will error if invoked.
STRIPE_SECRET_KEY=sk_test_xxx
# From: stripe listen --forward-to localhost:3000/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

with:

```
# ── Zeffy (donations + membership) ──────────────────────────────────────
# Per-tier Zeffy payment links are set in the admin Tier editor. This secret
# guards the stub activation webhook (/api/webhooks/zeffy), ready for a later
# Zeffy -> Zapier automation. An admin can also activate subscriptions manually.
ZEFFY_WEBHOOK_SECRET=change-me
```

Also, if `NEXT_PUBLIC_ZEFFY_URL` is not already present in the optional block, add it there:

```
# NEXT_PUBLIC_ZEFFY_URL=           # donation widget (embedded on /donate)
```

- [ ] **Step 4: Confirm no Stripe references remain**

Run: `grep -rin "stripe" src/ package.json .env.local.example`
Expected: no matches (exit code 1 / empty output). If anything prints, remove it.

- [ ] **Step 5: Full verification**

```bash
npx vitest run
npx tsc --noEmit
```
Expected: all tests pass (including `subscription-expiry.test.ts`); tsc clean.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "Remove Stripe lib, webhook, dependency, and env vars"
```

---

## Final verification (after all tasks)

- [ ] `npx vitest run` — all suites pass.
- [ ] `npx tsc --noEmit` — clean.
- [ ] `grep -rin "stripe" src/ package.json` — no matches.
- [ ] Production build: stop any running `next dev` first (a build clobbers its `.next`), then `npx next build` — confirm it compiles and `/api/webhooks/zeffy` + `/dashboard/admin/subscriptions` build.
- [ ] Restart the dev server for manual QA.
