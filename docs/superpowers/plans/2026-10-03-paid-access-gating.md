# Paid-Access Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restrict mentor chat, resources, and sessions to mentees on an active paid (Growth/Premium) subscription, showing everyone else an inline "upgrade to unlock" panel and refusing the backing APIs.

**Architecture:** A dependency-free pure function (`evaluateMenteeAccess`) decides access from role + subscription + plan; a thin service-role wrapper (`getMenteeAccess`) fetches those and calls it (fail-closed). Server pages render `<LockedFeature>` when blocked; the send-message and download APIs return 403; the chat dock consults `GET /api/me/access`. No DB schema changes.

**Tech Stack:** Next.js 14 (App Router), TypeScript, @supabase/ssr + service-role client, CSS modules, vitest (new dev dependency, for the pure-function unit test only).

## Global Constraints

- Next.js App Router, TypeScript strict — match existing file style and CSS-module pattern.
- Access rule (verbatim from spec): a mentee has access iff `is_current` subscription on a **paid** plan (`monthly_price > 0`), `status` in (`active`, `trial`), and `expires_at` null or in the future. `mentor`/`admin` always have access. Fail-closed on error.
- Blocked reasons: `no_subscription | free_tier | expired | cancelled | paused`; access reason `ok`.
- Server-enforced: UI locked states MUST be backed by server checks + API 403s.
- Do NOT run `npm run build` (or `next build`) while the dev server is running — it clobbers the dev `.next`. Verify types with `npx tsc --noEmit`. Only run a production build after stopping the dev server.
- Commit after each task. Co-author trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Pure access rule + unit tests

**Files:**
- Create: `src/lib/access-rule.ts`
- Create: `src/lib/access-rule.test.ts`
- Modify: `package.json` (add `vitest` devDependency + `test` script)

**Interfaces:**
- Produces: `type MenteeAccessReason = 'ok'|'no_subscription'|'free_tier'|'expired'|'cancelled'|'paused'`; `type MenteeAccess = { hasAccess: boolean; reason: MenteeAccessReason }`; `type AccessSubscription = { status: string; expires_at: string | null } | null`; `type AccessPlan = { monthly_price: number | string } | null`; `function evaluateMenteeAccess(role: string, subscription: AccessSubscription, plan: AccessPlan, now: Date): MenteeAccess`

- [ ] **Step 1: Add vitest and a test script**

Run:
```bash
npm install -D vitest@2
```
Then edit `package.json` `scripts` to add:
```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/access-rule.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { evaluateMenteeAccess } from './access-rule';

const NOW = new Date('2026-10-03T00:00:00Z');
const future = '2026-12-01T00:00:00Z';
const past = '2026-01-01T00:00:00Z';
const paid = { monthly_price: 5000 };
const free = { monthly_price: 0 };

describe('evaluateMenteeAccess', () => {
  it('allows mentors and admins regardless of subscription', () => {
    expect(evaluateMenteeAccess('mentor', null, null, NOW)).toEqual({ hasAccess: true, reason: 'ok' });
    expect(evaluateMenteeAccess('admin', null, null, NOW)).toEqual({ hasAccess: true, reason: 'ok' });
  });
  it('blocks a mentee with no subscription', () => {
    expect(evaluateMenteeAccess('mentee', null, null, NOW)).toEqual({ hasAccess: false, reason: 'no_subscription' });
  });
  it('blocks a mentee on the free tier', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: future }, free, NOW)).toEqual({ hasAccess: false, reason: 'free_tier' });
  });
  it('allows an active paid mentee', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: future }, paid, NOW)).toEqual({ hasAccess: true, reason: 'ok' });
  });
  it('allows a trialing paid mentee', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'trial', expires_at: future }, paid, NOW)).toEqual({ hasAccess: true, reason: 'ok' });
  });
  it('blocks a paid mentee past expires_at', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: past }, paid, NOW)).toEqual({ hasAccess: false, reason: 'expired' });
  });
  it('blocks cancelled / paused / expired statuses', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'cancelled', expires_at: future }, paid, NOW).reason).toBe('cancelled');
    expect(evaluateMenteeAccess('mentee', { status: 'paused', expires_at: future }, paid, NOW).reason).toBe('paused');
    expect(evaluateMenteeAccess('mentee', { status: 'expired', expires_at: future }, paid, NOW).reason).toBe('expired');
  });
  it('treats monthly_price as a number even if a numeric string', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: future }, { monthly_price: '5000.00' }, NOW).hasAccess).toBe(true);
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: future }, { monthly_price: '0.00' }, NOW).reason).toBe('free_tier');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/lib/access-rule.test.ts`
Expected: FAIL — cannot resolve `./access-rule` / `evaluateMenteeAccess` is not a function.

- [ ] **Step 4: Write the minimal implementation**

Create `src/lib/access-rule.ts`:
```ts
export type MenteeAccessReason =
  | 'ok'
  | 'no_subscription'
  | 'free_tier'
  | 'expired'
  | 'cancelled'
  | 'paused';

export type MenteeAccess = { hasAccess: boolean; reason: MenteeAccessReason };

export type AccessSubscription = {
  status: string;
  expires_at: string | null;
} | null;

export type AccessPlan = { monthly_price: number | string } | null;

/**
 * Decide whether a user may use the paid-gated features (mentor chat,
 * resources, sessions). Pure — no I/O. See the design spec for the rule.
 */
export function evaluateMenteeAccess(
  role: string,
  subscription: AccessSubscription,
  plan: AccessPlan,
  now: Date
): MenteeAccess {
  if (role === 'mentor' || role === 'admin') {
    return { hasAccess: true, reason: 'ok' };
  }
  if (!subscription) {
    return { hasAccess: false, reason: 'no_subscription' };
  }
  if (subscription.status === 'cancelled') {
    return { hasAccess: false, reason: 'cancelled' };
  }
  if (subscription.status === 'paused') {
    return { hasAccess: false, reason: 'paused' };
  }
  if (subscription.status === 'expired') {
    return { hasAccess: false, reason: 'expired' };
  }
  if (
    subscription.expires_at &&
    new Date(subscription.expires_at).getTime() <= now.getTime()
  ) {
    return { hasAccess: false, reason: 'expired' };
  }
  const price = Number(plan?.monthly_price ?? 0);
  if (!(price > 0)) {
    return { hasAccess: false, reason: 'free_tier' };
  }
  if (subscription.status === 'active' || subscription.status === 'trial') {
    return { hasAccess: true, reason: 'ok' };
  }
  return { hasAccess: false, reason: 'expired' };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/lib/access-rule.test.ts`
Expected: PASS (all cases green).

- [ ] **Step 6: Commit**

```bash
git add src/lib/access-rule.ts src/lib/access-rule.test.ts package.json package-lock.json
git commit -m "Add pure mentee access rule + unit tests"
```

---

### Task 2: Access wrapper + /api/me/access route

**Files:**
- Create: `src/lib/access.ts`
- Create: `src/app/api/me/access/route.ts`

**Interfaces:**
- Consumes: `evaluateMenteeAccess`, `MenteeAccess` from `./access-rule`; `createAdminClient` from `./supabase/admin`.
- Produces: `async function getMenteeAccess(userId: string): Promise<MenteeAccess>`; `GET /api/me/access` → `200 { hasAccess, reason }` (auth required, else `401`).

- [ ] **Step 1: Write the wrapper**

Create `src/lib/access.ts`:
```ts
import { createAdminClient } from './supabase/admin';
import { evaluateMenteeAccess, type MenteeAccess } from './access-rule';

/**
 * Fetch the user's role + current subscription + plan and evaluate paid
 * access. Uses the service role for reliable reads. Fail-closed: any error
 * denies access (data itself stays protected by RLS regardless).
 */
export async function getMenteeAccess(userId: string): Promise<MenteeAccess> {
  try {
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const role = profile?.role ?? 'mentee';
    if (role === 'mentor' || role === 'admin') {
      return { hasAccess: true, reason: 'ok' };
    }

    const { data: sub } = await admin
      .from('subscriptions')
      .select('status, expires_at, plan_id')
      .eq('user_id', userId)
      .eq('is_current', true)
      .maybeSingle();

    let plan: { monthly_price: number | string } | null = null;
    if (sub?.plan_id) {
      const { data: p } = await admin
        .from('plans')
        .select('monthly_price')
        .eq('id', sub.plan_id)
        .single();
      plan = p ?? null;
    }

    return evaluateMenteeAccess(role, sub ?? null, plan, new Date());
  } catch (error) {
    console.error('[getMenteeAccess]', error);
    return { hasAccess: false, reason: 'no_subscription' };
  }
}
```

- [ ] **Step 2: Write the route**

Create `src/app/api/me/access/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMenteeAccess } from '@/lib/access';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const access = await getMenteeAccess(user.id);
  return NextResponse.json(access);
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Verify the route is wired (dev server running)**

Run: `curl -s -o NUL -w "%{http_code}\n" http://localhost:3000/api/me/access`
Expected: `401` (exists, auth-gated) — use PowerShell `Invoke-WebRequest` if curl is unavailable; a 401 confirms the route resolves.

- [ ] **Step 5: Commit**

```bash
git add src/lib/access.ts src/app/api/me/access/route.ts
git commit -m "Add getMenteeAccess wrapper + /api/me/access route"
```

---

### Task 3: LockedFeature component

**Files:**
- Create: `src/components/dashboard/LockedFeature.tsx`
- Create: `src/components/dashboard/LockedFeature.module.css`

**Interfaces:**
- Consumes: `MenteeAccessReason` from `@/lib/access-rule`.
- Produces: `export default function LockedFeature({ feature, reason }: { feature: string; reason: MenteeAccessReason })`.

- [ ] **Step 1: Write the component**

Create `src/components/dashboard/LockedFeature.tsx`:
```tsx
import Link from 'next/link';
import type { MenteeAccessReason } from '@/lib/access-rule';
import styles from './LockedFeature.module.css';

const COPY: Record<MenteeAccessReason, string> = {
  ok: '',
  no_subscription: 'Choose a membership plan to unlock this feature.',
  free_tier:
    'This feature is included with the Growth and Premium plans. Upgrade to unlock it.',
  expired: 'Your subscription has expired. Renew it to regain access.',
  cancelled: 'Your subscription was cancelled. Resubscribe to regain access.',
  paused: 'Your subscription is paused. Resume it to regain access.',
};

export default function LockedFeature({
  feature,
  reason,
}: {
  feature: string;
  reason: MenteeAccessReason;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon} aria-hidden="true">🔒</div>
      <h2 className={styles.title}>{feature} is locked</h2>
      <p className={styles.message}>{COPY[reason] || COPY.no_subscription}</p>
      <Link href="/dashboard/mentee/subscription" className={styles.cta}>
        Choose a plan
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Write the styles**

Create `src/components/dashboard/LockedFeature.module.css`:
```css
.wrapper {
  max-width: 480px;
  margin: var(--spacing-10) auto;
  text-align: center;
  padding: var(--spacing-10) var(--spacing-6);
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.icon { font-size: 2.5rem; margin-bottom: var(--spacing-4); }

.title {
  font-size: var(--text-2xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-3);
}

.message {
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--spacing-6);
}

.cta {
  display: inline-block;
  padding: var(--spacing-3) var(--spacing-6);
  background: var(--brand-700);
  color: #fff;
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
}

.cta:hover { background: var(--brand-800); }
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/LockedFeature.tsx src/components/dashboard/LockedFeature.module.css
git commit -m "Add LockedFeature upgrade panel component"
```

---

### Task 4: Gate the three server pages

**Files:**
- Modify: `src/app/dashboard/messages/page.tsx`
- Modify: `src/app/dashboard/mentee/resources/page.tsx`
- Modify: `src/app/dashboard/mentee/sessions/page.tsx`

**Interfaces:**
- Consumes: `getMenteeAccess` from `@/lib/access`; `LockedFeature` from `@/components/dashboard/LockedFeature`.

- [ ] **Step 1: Gate the messages page**

In `src/app/dashboard/messages/page.tsx`, add imports near the other imports:
```ts
import { getMenteeAccess } from '@/lib/access';
import LockedFeature from '@/components/dashboard/LockedFeature';
```
After the current user is resolved (the `const { data: { user } } = await supabase.auth.getUser();` block) and before conversations are fetched/returned, add:
```tsx
  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return <LockedFeature feature="Messages" reason={access.reason} />;
  }
```
(If the page currently calls `getMyConversations()` before using `user`, move the access check to run first so a blocked user never triggers that query.)

- [ ] **Step 2: Gate the mentee resources page**

In `src/app/dashboard/mentee/resources/page.tsx`, add the same two imports, and after the `user` is resolved and the mentee-role check, before loading resources, add:
```tsx
  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return <LockedFeature feature="Resources" reason={access.reason} />;
  }
```

- [ ] **Step 3: Gate the mentee sessions page**

In `src/app/dashboard/mentee/sessions/page.tsx`, add the same two imports, and after `user` is resolved, before loading sessions, add:
```tsx
  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return <LockedFeature feature="Sessions" reason={access.reason} />;
  }
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/dashboard/messages/page.tsx" "src/app/dashboard/mentee/resources/page.tsx" "src/app/dashboard/mentee/sessions/page.tsx"
git commit -m "Gate messages, resources, sessions pages behind paid access"
```

---

### Task 5: Gate the send-message and download APIs (403)

**Files:**
- Modify: `src/app/api/messages/route.ts`
- Modify: `src/app/api/resources/[id]/download/route.ts`

**Interfaces:**
- Consumes: `getMenteeAccess` from `@/lib/access`.

- [ ] **Step 1: Gate POST /api/messages**

In `src/app/api/messages/route.ts`, add `import { getMenteeAccess } from '@/lib/access';` and, immediately after the `user` null-check (before inserting the message), add:
```ts
  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'Upgrade required' }, { status: 403 });
  }
```

- [ ] **Step 2: Gate the download route**

In `src/app/api/resources/[id]/download/route.ts`, add `import { getMenteeAccess } from '@/lib/access';` and, after the `user` null-check and before (or just after) loading the resource, add:
```ts
  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'Upgrade required' }, { status: 403 });
  }
```
(`getMenteeAccess` returns `hasAccess: true` for mentors/admins, so only blocked mentees are refused; the existing `canAccess` visibility check stays below.)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Verify both endpoints are gated (dev server running)**

Unauthenticated requests should still be 401 (auth runs first):
```bash
curl -s -o NUL -w "msgs:%{http_code}\n" -X POST http://localhost:3000/api/messages
```
Expected: `401` unauthenticated. (The 403 path is exercised in Task 7 with a blocked test mentee.)

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/messages/route.ts" "src/app/api/resources/[id]/download/route.ts"
git commit -m "Return 403 from message-send and download APIs for unpaid mentees"
```

---

### Task 6: Chat dock locked state

**Files:**
- Modify: `src/components/chat/ChatDock.tsx`

**Interfaces:**
- Consumes: `GET /api/me/access` → `{ hasAccess, reason }`.

- [ ] **Step 1: Fetch access and store it**

In `src/components/chat/ChatDock.tsx`, add state near the other `useState` calls:
```tsx
  const [blocked, setBlocked] = useState(false);
```
Inside the init effect, after `setUserId(user.id);`, add:
```tsx
      try {
        const res = await fetch('/api/me/access');
        if (res.ok) {
          const a = await res.json();
          if (active) setBlocked(a.hasAccess === false);
        }
      } catch {
        /* leave unblocked on transient error; the send API still enforces 403 */
      }
```

- [ ] **Step 2: Render a locked panel when blocked**

Replace the expanded dock body so that, when `blocked` is true, it shows an upgrade prompt instead of threads/composer. Just after the header `</div>` inside the expanded `return` (the `<div className={styles.dock}>` branch), gate the content:
```tsx
      {blocked ? (
        <div className={styles.empty}>
          <p>Upgrade to a paid plan to message your mentor.</p>
          <a href="/dashboard/mentee/subscription" className={styles.threadName}>
            Choose a plan →
          </a>
        </div>
      ) : !activeThread ? (
        /* ...existing thread-list branch... */
      ) : (
        /* ...existing conversation branch... */
      )}
```
Keep the existing two branches intact inside the ternary; only add the `blocked` branch in front.

- [ ] **Step 3: Show a lock on the collapsed launcher when blocked**

In the collapsed `return` (`styles.launcher` button), when `blocked` is true, render a small lock. Replace the badge expression so a blocked user sees a lock instead of an unread count:
```tsx
        {blocked ? (
          <span className={styles.launcherBadge}>🔒</span>
        ) : unread > 0 ? (
          <span className={styles.launcherBadge}>{unread > 9 ? '9+' : unread}</span>
        ) : null}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/ChatDock.tsx
git commit -m "Lock the chat dock for unpaid mentees"
```

---

### Task 7: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the unit tests**

Run: `npx vitest run`
Expected: all `access-rule` tests PASS.

- [ ] **Step 2: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build (stop the dev server first)**

Stop the dev server, clear `.next`, then:
```bash
npm run build
```
Expected: "Compiled successfully" and all pages generated. Restart `npm run dev` afterward.

- [ ] **Step 4: Manual gating check against the live DB**

Pick a test mentee (e.g. `mentor@mtd.org` is a mentor; use a mentee account). Using the Supabase Management API script pattern already in `scripts/`, toggle their current subscription to exercise each state, and confirm:
  - No/Free/expired/cancelled subscription → `/dashboard/messages`, `/dashboard/mentee/resources`, `/dashboard/mentee/sessions` show the LockedFeature panel; the chat-dock launcher shows a lock; `POST /api/messages` and the download route return 403.
  - Active Growth/Premium subscription → all three pages load normally; dock works; APIs succeed.
  - A mentor/admin account → never gated anywhere.

- [ ] **Step 5: Final commit (if any verification tweaks were needed)**

```bash
git add -A
git commit -m "Verify paid-access gating end to end"
```

---

## Self-Review

**Spec coverage:**
- Access rule → Task 1 (pure fn) + Task 2 (wrapper). ✓
- Inline locked UX → Task 3 (component) + Task 4 (pages). ✓
- Server-enforced APIs (403) → Task 5. ✓
- `/api/me/access` + chat dock → Task 2 + Task 6. ✓
- Fail-closed → Task 2 (try/catch). ✓
- Mentor/admin never gated → encoded in `evaluateMenteeAccess` (Task 1), used everywhere. ✓
- Tests → Task 1 (unit) + Task 7 (build + manual). ✓

**Placeholder scan:** none — every step has concrete code or an exact command.

**Type consistency:** `MenteeAccess`/`MenteeAccessReason` defined in Task 1, imported unchanged in Tasks 2/3; `getMenteeAccess(userId): Promise<MenteeAccess>` used identically in Tasks 2/4/5; `/api/me/access` shape `{ hasAccess, reason }` produced in Task 2 and consumed in Task 6.
