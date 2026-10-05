# Mentee Profile Setup (Onboarding) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require new mentees to complete a one-page onboarding (interests + career goals + plan) before using the rest of the dashboard; Free activates immediately, paid tiers route to checkout (stub-ready).

**Architecture:** New `user_profiles` columns store the data + an `onboarding_completed` flag. A server `dashboard/mentee/layout.tsx` redirects un-onboarded mentees to `/dashboard/onboarding` (outside that layout, so no loop). A submit API saves the data, marks onboarding complete, creates a Free subscription for the Free tier, and signals the client to run the existing checkout route for paid tiers.

**Tech Stack:** Next.js 14 App Router, TypeScript, @supabase/ssr + service-role client, zod, CSS modules, vitest (already installed), Supabase Management API for the migration.

## Global Constraints

- Next.js App Router, TypeScript strict — match existing file/CSS-module style.
- New columns: `interests text[]`, `career_goals text[]`, `onboarding_completed boolean not null default false` on `public.user_profiles`.
- Onboarding is mandatory, mentee-role only; mentors/admins never gated. Gate is server-enforced.
- `needsOnboarding(role, onboardingCompleted)` is true ONLY when `role === 'mentee' && onboardingCompleted === false`.
- Tier: Free (`monthly_price === 0`) → create an active `is_current` subscription + go to `/dashboard/mentee`. Paid → client runs the existing `/api/subscriptions/checkout`; on a returned URL go there, otherwise `/dashboard/mentee/subscription?pending=1`. Onboarding completion never depends on payment.
- Interest categories (verbatim): Entrepreneurship, Leadership, Technology & STEM, Finance, Marketing & Branding, Healthcare, Education, Creative Arts, Nonprofit & Social Impact, Career Transition, Public Speaking, Work–Life Balance.
- DB changes applied via the Supabase Management API using `SUPABASE_ACCESS_TOKEN` from `.env.local` (a PAT). Do NOT reset the DB password.
- Verify types with `npx tsc --noEmit`. Do NOT run `next build`/`npm run build` while the dev server is running (it clobbers `.next`); only build after stopping it.
- Commit after each task. Trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Git Bash from repo root.

---

### Task 1: DB migration (onboarding columns) + reusable apply-sql script

**Files:**
- Create: `scripts/apply-sql.mjs`
- Create: `supabase/migrations/0008_mentee_onboarding_columns.sql`

**Interfaces:**
- Produces: `user_profiles.interests text[]`, `user_profiles.career_goals text[]`, `user_profiles.onboarding_completed boolean not null default false`.

- [ ] **Step 1: Write a generic single-statement applier**

Create `scripts/apply-sql.mjs`:
```js
// Apply SQL to Supabase via the Management API (PAT in .env.local).
// Usage: node scripts/apply-sql.mjs <file.sql | "SELECT ...">
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env.local'))) {
  for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const REF = process.env.SUPABASE_PROJECT_REF || 'vhtnwxbfpnzjslctabyv';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('Missing SUPABASE_ACCESS_TOKEN in .env.local'); process.exit(1); }

const arg = process.argv[2];
if (!arg) { console.error('Usage: node scripts/apply-sql.mjs <file.sql | "SQL">'); process.exit(1); }
const query = existsSync(arg) ? readFileSync(arg, 'utf8') : arg;

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});
const text = await res.text();
if (!res.ok) { console.error(`HTTP ${res.status}: ${text}`); process.exit(1); }
console.log(text);
```

- [ ] **Step 2: Write the migration**

Create `supabase/migrations/0008_mentee_onboarding_columns.sql`:
```sql
-- Mentee onboarding: interests, career goals, and a completion flag.
alter table public.user_profiles
  add column if not exists interests text[],
  add column if not exists career_goals text[],
  add column if not exists onboarding_completed boolean not null default false;
```

- [ ] **Step 3: Apply the migration**

Run: `node scripts/apply-sql.mjs supabase/migrations/0008_mentee_onboarding_columns.sql`
Expected: prints a result (no HTTP error). Idempotent.

- [ ] **Step 4: Verify the columns exist**

Run:
```bash
node scripts/apply-sql.mjs "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='user_profiles' and column_name in ('interests','career_goals','onboarding_completed') order by column_name"
```
Expected: three rows — `career_goals` (ARRAY), `interests` (ARRAY), `onboarding_completed` (boolean).

- [ ] **Step 5: Commit**

```bash
git add scripts/apply-sql.mjs supabase/migrations/0008_mentee_onboarding_columns.sql
git commit -m "Add mentee onboarding columns + generic apply-sql script"
```

---

### Task 2: Pure helpers + interest categories + unit tests

**Files:**
- Create: `src/lib/onboarding.ts`
- Create: `src/lib/onboarding.test.ts`
- Create: `src/lib/onboarding-options.ts`

**Interfaces:**
- Produces: `needsOnboarding(role: string, onboardingCompleted: boolean): boolean`; `tierKind(monthlyPrice: number | string | null | undefined): 'free' | 'paid'`; `INTEREST_CATEGORIES: readonly string[]`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/onboarding.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { needsOnboarding, tierKind } from './onboarding';

describe('needsOnboarding', () => {
  it('is true only for a mentee who has not completed onboarding', () => {
    expect(needsOnboarding('mentee', false)).toBe(true);
  });
  it('is false for a mentee who completed onboarding', () => {
    expect(needsOnboarding('mentee', true)).toBe(false);
  });
  it('is false for mentors and admins regardless', () => {
    expect(needsOnboarding('mentor', false)).toBe(false);
    expect(needsOnboarding('admin', false)).toBe(false);
  });
});

describe('tierKind', () => {
  it('treats price 0 (or missing) as free', () => {
    expect(tierKind(0)).toBe('free');
    expect(tierKind('0.00')).toBe('free');
    expect(tierKind(null)).toBe('free');
    expect(tierKind(undefined)).toBe('free');
  });
  it('treats a positive price as paid', () => {
    expect(tierKind(5000)).toBe('paid');
    expect(tierKind('12000.00')).toBe('paid');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/onboarding.test.ts`
Expected: FAIL — cannot resolve `./onboarding`.

- [ ] **Step 3: Write the helpers and the options**

Create `src/lib/onboarding.ts`:
```ts
/** True only when a mentee has not yet completed onboarding. */
export function needsOnboarding(
  role: string,
  onboardingCompleted: boolean
): boolean {
  return role === 'mentee' && onboardingCompleted === false;
}

/** Whether a plan's price makes it a free or paid tier. */
export function tierKind(
  monthlyPrice: number | string | null | undefined
): 'free' | 'paid' {
  return Number(monthlyPrice ?? 0) > 0 ? 'paid' : 'free';
}
```

Create `src/lib/onboarding-options.ts`:
```ts
export const INTEREST_CATEGORIES = [
  'Entrepreneurship',
  'Leadership',
  'Technology & STEM',
  'Finance',
  'Marketing & Branding',
  'Healthcare',
  'Education',
  'Creative Arts',
  'Nonprofit & Social Impact',
  'Career Transition',
  'Public Speaking',
  'Work–Life Balance',
] as const;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/onboarding.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding.ts src/lib/onboarding.test.ts src/lib/onboarding-options.ts
git commit -m "Add onboarding helpers (needsOnboarding, tierKind) + interest categories"
```

---

### Task 3: Submit API `POST /api/mentee/onboarding`

**Files:**
- Create: `src/app/api/mentee/onboarding/route.ts`

**Interfaces:**
- Consumes: `tierKind` from `@/lib/onboarding`; `createClient` from `@/lib/supabase/server`; `createAdminClient` from `@/lib/supabase/admin`.
- Produces: `POST /api/mentee/onboarding` — body `{ interests: string[], careerGoals: string[], planId: string }`. Responses: `401` unauth, `403` non-mentee, `400` bad input/plan, `200 { redirect: '/dashboard/mentee' }` (free) or `200 { next: 'checkout', planId }` (paid).

- [ ] **Step 1: Write the route**

Create `src/app/api/mentee/onboarding/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { tierKind } from '@/lib/onboarding';

const schema = z.object({
  interests: z.array(z.string().trim().min(1)).min(1, 'Pick at least one interest.'),
  careerGoals: z.array(z.string().trim().min(1)).min(1, 'Add at least one career goal.'),
  planId: z.string().uuid('Choose a plan.'),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'mentee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError ? err.issues[0].message : 'Invalid request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data: plan } = await admin
    .from('plans')
    .select('id, monthly_price, is_active')
    .eq('id', body.planId)
    .single();
  if (!plan || !plan.is_active) {
    return NextResponse.json({ error: 'Plan not found.' }, { status: 400 });
  }

  // Save profile fields + mark onboarding complete.
  const { error: updateError } = await admin
    .from('user_profiles')
    .update({
      interests: body.interests,
      career_goals: body.careerGoals,
      onboarding_completed: true,
    })
    .eq('id', user.id);
  if (updateError) {
    console.error('[mentee/onboarding] profile update', updateError);
    return NextResponse.json({ error: 'Could not save your profile.' }, { status: 500 });
  }

  if (tierKind(plan.monthly_price) === 'free') {
    // Activate the Free plan immediately.
    await admin
      .from('subscriptions')
      .update({ is_current: false })
      .eq('user_id', user.id)
      .eq('is_current', true);
    await admin.from('subscriptions').insert({
      user_id: user.id,
      plan_id: plan.id,
      status: 'active',
      billing_cycle: 'monthly',
      started_at: new Date().toISOString(),
      is_current: true,
      auto_renew: true,
    });
    return NextResponse.json({ redirect: '/dashboard/mentee' });
  }

  // Paid: onboarding is already complete; the client runs checkout next.
  return NextResponse.json({ next: 'checkout', planId: plan.id });
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify the route is auth-gated (dev server running)**

Run (PowerShell):
```
powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3000/api/mentee/onboarding -Method POST -UseBasicParsing).StatusCode } catch { $_.Exception.Response.StatusCode.value__ }"
```
Expected: `401` (exists, auth-gated).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/mentee/onboarding/route.ts
git commit -m "Add POST /api/mentee/onboarding (save profile, activate free / signal checkout)"
```

---

### Task 4: Onboarding page + client form

**Files:**
- Create: `src/app/dashboard/onboarding/page.tsx`
- Create: `src/app/dashboard/onboarding/OnboardingForm.tsx`
- Create: `src/app/dashboard/onboarding/onboarding.module.css`

**Interfaces:**
- Consumes: `INTEREST_CATEGORIES` from `@/lib/onboarding-options`; `GET /api/subscriptions/plans` (returns `Array<{ _id, name, description, pricePerMonth, features, isActive, zeffyUrl }>`); `POST /api/mentee/onboarding` and `POST /api/subscriptions/checkout` (`{ tierId }` → `{ url?, error? }`).

- [ ] **Step 1: Write the server page (redirects non-mentees / already-onboarded)**

Create `src/app/dashboard/onboarding/page.tsx`:
```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingForm from './OnboardingForm';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Welcome | Set up your profile' };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'mentee' || profile.onboarding_completed) {
    redirect('/dashboard');
  }

  return <OnboardingForm />;
}
```

- [ ] **Step 2: Write the client form**

Create `src/app/dashboard/onboarding/OnboardingForm.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { INTEREST_CATEGORIES } from '@/lib/onboarding-options';
import styles from './onboarding.module.css';

type Plan = {
  _id: string;
  name: string;
  description: string;
  pricePerMonth: number;
  features: string[];
};

export default function OnboardingForm() {
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<string>('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/subscriptions/plans')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Plan[]) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]));
  }, []);

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }
  function addCustomInterest() {
    const v = customInterest.trim();
    if (v && !interests.includes(v)) setInterests((prev) => [...prev, v]);
    setCustomInterest('');
  }
  function addGoal() {
    const v = goalInput.trim();
    if (v && !goals.includes(v)) setGoals((prev) => [...prev, v]);
    setGoalInput('');
  }
  function removeGoal(v: string) {
    setGoals((prev) => prev.filter((g) => g !== v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (interests.length === 0) return setError('Pick at least one interest.');
    if (goals.length === 0) return setError('Add at least one career goal.');
    if (!planId) return setError('Choose a plan.');

    setSaving(true);
    try {
      const res = await fetch('/api/mentee/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, careerGoals: goals, planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSaving(false);
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (data.next === 'checkout') {
        const c = await fetch('/api/subscriptions/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId: data.planId }),
        });
        const cd = await c.json().catch(() => ({}));
        window.location.href =
          c.ok && cd.url ? cd.url : '/dashboard/mentee/subscription?pending=1';
        return;
      }
      window.location.href = '/dashboard/mentee';
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome! Let&apos;s set up your profile</h1>
        <p className={styles.subtitle}>
          Tell us about yourself so we can match you with the right mentor.
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your interests</h2>
        <div className={styles.chips}>
          {INTEREST_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`${styles.chip} ${interests.includes(cat) ? styles.chipOn : ''}`}
              onClick={() => toggleInterest(cat)}
              aria-pressed={interests.includes(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={styles.addRow}>
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addCustomInterest(); }
            }}
            placeholder="Add your own…"
          />
          <button type="button" onClick={addCustomInterest}>Add</button>
        </div>
        {interests.filter((i) => !INTEREST_CATEGORIES.includes(i as never)).length > 0 && (
          <div className={styles.chips}>
            {interests
              .filter((i) => !INTEREST_CATEGORIES.includes(i as never))
              .map((i) => (
                <button type="button" key={i} className={`${styles.chip} ${styles.chipOn}`} onClick={() => toggleInterest(i)}>
                  {i} ✕
                </button>
              ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your career goals</h2>
        <div className={styles.addRow}>
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addGoal(); }
            }}
            placeholder="e.g. Launch my own business"
          />
          <button type="button" onClick={addGoal}>Add</button>
        </div>
        <ul className={styles.goalList}>
          {goals.map((g) => (
            <li key={g} className={styles.goalItem}>
              <span>{g}</span>
              <button type="button" onClick={() => removeGoal(g)} aria-label={`Remove ${g}`}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Choose a plan</h2>
        <div className={styles.plans}>
          {plans.map((p) => (
            <label
              key={p._id}
              className={`${styles.planCard} ${planId === p._id ? styles.planOn : ''}`}
            >
              <input
                type="radio"
                name="plan"
                value={p._id}
                checked={planId === p._id}
                onChange={() => setPlanId(p._id)}
              />
              <span className={styles.planName}>{p.name}</span>
              <span className={styles.planPrice}>
                ${(p.pricePerMonth / 100).toFixed(2)}/mo
              </span>
              {p.description && <span className={styles.planDesc}>{p.description}</span>}
            </label>
          ))}
        </div>
      </section>

      {error && <div className={styles.error} role="alert">{error}</div>}

      <button type="submit" className={styles.submit} disabled={saving}>
        {saving ? 'Saving…' : 'Finish setup'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write the styles**

Create `src/app/dashboard/onboarding/onboarding.module.css`:
```css
.page { max-width: 760px; margin: 0 auto; padding: var(--spacing-8) var(--spacing-4); display: flex; flex-direction: column; gap: var(--spacing-8); }
.header { text-align: center; }
.title { font-size: var(--text-3xl); color: var(--text-primary); margin-bottom: var(--spacing-2); }
.subtitle { color: var(--text-secondary); }
.section { display: flex; flex-direction: column; gap: var(--spacing-4); }
.sectionTitle { font-size: var(--text-xl); color: var(--brand-700); }
.chips { display: flex; flex-wrap: wrap; gap: var(--spacing-2); }
.chip { padding: var(--spacing-2) var(--spacing-4); border: 1px solid var(--border-color); border-radius: 9999px; background: var(--surface-1); color: var(--text-primary); cursor: pointer; font-size: var(--text-sm); }
.chipOn { background: var(--brand-700); color: #fff; border-color: var(--brand-700); }
.addRow { display: flex; gap: var(--spacing-2); }
.addRow input { flex: 1; padding: var(--spacing-3); border: 1px solid var(--border-color); border-radius: var(--radius-md); font: inherit; }
.addRow button { padding: var(--spacing-3) var(--spacing-5); border: none; border-radius: var(--radius-md); background: var(--brand-700); color: #fff; font-weight: 600; cursor: pointer; }
.goalList { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-2); }
.goalItem { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-3); background: var(--surface-1); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
.goalItem button { background: none; border: none; cursor: pointer; color: var(--text-secondary); }
.plans { display: grid; grid-template-columns: 1fr; gap: var(--spacing-4); }
.planCard { display: flex; flex-direction: column; gap: var(--spacing-1); padding: var(--spacing-5); border: 2px solid var(--border-color); border-radius: var(--radius-lg); cursor: pointer; }
.planCard input { position: absolute; opacity: 0; }
.planOn { border-color: var(--brand-700); box-shadow: var(--shadow-md); }
.planName { font-weight: 700; font-size: var(--text-lg); color: var(--text-primary); }
.planPrice { color: var(--brand-700); font-weight: 600; }
.planDesc { color: var(--text-secondary); font-size: var(--text-sm); }
.error { color: var(--error, #c0392b); font-size: var(--text-sm); }
.submit { align-self: center; padding: var(--spacing-4) var(--spacing-8); border: none; border-radius: var(--radius-md); background: var(--brand-700); color: #fff; font-weight: 700; font-size: var(--text-lg); cursor: pointer; }
.submit:disabled { opacity: 0.6; cursor: default; }
@media (min-width: 640px) { .plans { grid-template-columns: repeat(3, 1fr); } }
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/dashboard/onboarding/page.tsx" "src/app/dashboard/onboarding/OnboardingForm.tsx" "src/app/dashboard/onboarding/onboarding.module.css"
git commit -m "Add mentee onboarding page + form (interests, goals, plan)"
```

---

### Task 5: Mentee layout onboarding gate

**Files:**
- Create: `src/app/dashboard/mentee/layout.tsx`

**Interfaces:**
- Consumes: `needsOnboarding` from `@/lib/onboarding`; `createClient` from `@/lib/supabase/server`.

- [ ] **Step 1: Write the server layout gate**

Create `src/app/dashboard/mentee/layout.tsx`:
```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { needsOnboarding } from '@/lib/onboarding';

export const dynamic = 'force-dynamic';

export default async function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single();

  // Fail-safe: only redirect on a definitive not-completed mentee.
  if (profile && needsOnboarding(profile.role, profile.onboarding_completed === true)) {
    redirect('/dashboard/onboarding');
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Confirm no redirect loop in code review of the diff**

Verify: the onboarding page is at `src/app/dashboard/onboarding/` (NOT under `src/app/dashboard/mentee/`), so this layout never wraps — and never redirects — the onboarding route. Confirm by listing:
```bash
ls "src/app/dashboard/onboarding/page.tsx" && ls "src/app/dashboard/mentee/layout.tsx"
```
Expected: both exist; onboarding is outside the mentee folder.

- [ ] **Step 4: Commit**

```bash
git add "src/app/dashboard/mentee/layout.tsx"
git commit -m "Gate /dashboard/mentee/* behind completed onboarding"
```

---

### Task 6: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Unit tests**

Run: `npx vitest run`
Expected: all tests PASS (existing access-rule tests + new onboarding tests).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build (stop the dev server first)**

Stop the dev server, clear `.next`, then `npm run build`.
Expected: "Compiled successfully" and all pages generated. Restart `npm run dev` after.

- [ ] **Step 4: Manual verification against the live DB**

Using `node scripts/apply-sql.mjs "<SQL>"` and a test mentee account:
  - Set the test mentee's `onboarding_completed = false`; confirm visiting `/dashboard/mentee` redirects to `/dashboard/onboarding`, and a mentor/admin account does not.
  - Submit the form choosing **Free**: confirm `user_profiles.interests` / `career_goals` are saved, `onboarding_completed = true`, an `is_current` active subscription on the Free plan exists, and the mentee lands on `/dashboard/mentee` and is no longer redirected to onboarding.
  - Reset another test mentee and submit choosing **Growth/Premium** (no price ID): confirm onboarding is marked complete and the user lands on `/dashboard/mentee/subscription?pending=1`.

- [ ] **Step 5: Final commit (if verification required tweaks)**

```bash
git add -A
git commit -m "Verify mentee onboarding end to end"
```

---

## Self-Review

**Spec coverage:**
- New columns → Task 1. ✓
- `needsOnboarding` + `tierKind` + categories → Task 2. ✓
- Submit API (save + free-activate + paid-signal, 401/403/400) → Task 3. ✓
- Onboarding page + form (interests chips+custom, goals list, plan cards) → Task 4. ✓
- Server mentee-layout gate + redirect to `/dashboard/onboarding` (outside the layout, no loop) → Task 5. ✓
- Interaction with paid-access gating (unchanged) → design note; no code needed. ✓
- Fail-safe gate (redirect only on definitive false) → Task 5 code. ✓
- Tests → Task 2 (unit) + Task 6 (build + manual). ✓

**Placeholder scan:** none — every step has concrete code or exact commands.

**Type consistency:** `needsOnboarding(role, onboardingCompleted): boolean` and `tierKind(price): 'free'|'paid'` defined in Task 2, used identically in Tasks 3/5; `INTEREST_CATEGORIES` defined in Task 2, consumed in Task 4; the API response shapes (`{ redirect }` / `{ next:'checkout', planId }`) produced in Task 3 are consumed in Task 4's form; `/api/subscriptions/plans` item shape (`_id`, `pricePerMonth`, …) matches the existing route.
