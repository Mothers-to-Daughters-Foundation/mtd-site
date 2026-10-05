# Automatic Mentor–Mentee Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically pair paid-active mentees with the best-fitting mentor (deterministic then soft scoring, load-balanced), creating an active mentorship — runnable from an admin button now and from the Stripe webhook later — with admin reassign.

**Architecture:** A pure, unit-tested scoring engine ranks mentors for a mentee. A fail-safe service (`autoMatchMentee`) checks role + paid access + existing mentorship, ranks candidates via the service role, and creates the mentorship. An admin route runs it across all mentees; the Stripe webhook runs it per subscriber; the admin matches page gains a "Run auto-match" button and a reassign control. Mentors set structured career areas on their profile.

**Tech Stack:** Next.js 14 App Router, TypeScript, @supabase/ssr + service-role client, zod, vitest (installed), CSS modules, Supabase Management API for the migration.

## Global Constraints

- Next.js App Router, TypeScript strict — match existing file/CSS-module style.
- New column: `career_areas text[]` on `public.user_profiles`. Matches are rows in the existing `mentorships` table (`mentor_id, mentee_id, status`).
- Eligibility (verbatim): auto-match only a user whose `role === 'mentee'`, who is paid-active (`getMenteeAccess(menteeId).hasAccess === true`), and who has no `status='active'` mentorship. Never force a zero-overlap pairing.
- Scoring: **deterministic** = size of exact (case-insensitive, trimmed) intersection of `mentee.interests` and `mentor.career_areas`; **soft** (only when deterministic is 0) = count of shared word-tokens across `mentee.interests + careerGoals` vs `mentor.career_areas + expertise`; else **none**. Rank: kind (deterministic > soft > none), then score desc, then `activeMenteeCount` asc.
- `autoMatchMentee` is fail-safe: it never throws; any error → `{ matched: false, reason: 'error' }` (logged). Reasons: `not_mentee | not_paid | already_matched | no_candidate | error`.
- Interest/career-area vocabulary is the shared `INTEREST_CATEGORIES` from `@/lib/onboarding-options`.
- DB change applied via the Supabase Management API: `node scripts/apply-sql.mjs <file.sql>` (reads `SUPABASE_ACCESS_TOKEN` PAT from `.env.local`). Do NOT reset the DB password.
- Verify types with `npx tsc --noEmit`. Do NOT run `next build`/`npm run build` while the dev server is running; only build after stopping it.
- Commit after each task. Trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Git Bash from repo root.

---

### Task 1: DB migration — mentor career_areas

**Files:**
- Create: `supabase/migrations/0009_mentor_career_areas.sql`

**Interfaces:**
- Produces: `user_profiles.career_areas text[]`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0009_mentor_career_areas.sql`:
```sql
-- Structured career areas for mentors (shared vocabulary with mentee interests).
alter table public.user_profiles
  add column if not exists career_areas text[];
```

- [ ] **Step 2: Apply it**

Run: `node scripts/apply-sql.mjs supabase/migrations/0009_mentor_career_areas.sql`
Expected: prints a result, no HTTP error. Idempotent.

- [ ] **Step 3: Verify the column**

Run:
```bash
node scripts/apply-sql.mjs "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='user_profiles' and column_name='career_areas'"
```
Expected: one row — `career_areas` (ARRAY).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0009_mentor_career_areas.sql
git commit -m "Add user_profiles.career_areas column for mentor matching"
```

---

### Task 2: Matching engine + unit tests

**Files:**
- Create: `src/lib/matching.ts`
- Create: `src/lib/matching.test.ts`

**Interfaces:**
- Produces: `type MenteeForMatch = { interests: string[]; careerGoals: string[] }`; `type MentorForMatch = { id: string; careerAreas: string[]; expertise: string | null; activeMenteeCount: number }`; `type MatchKind = 'deterministic' | 'soft' | 'none'`; `type MentorScore = { mentorId: string; score: number; kind: MatchKind }`; `scoreMentor(mentee, mentor): MentorScore`; `rankMentors(mentee, mentors): MentorScore[]`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/matching.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { scoreMentor, rankMentors, type MentorForMatch } from './matching';

const mentor = (over: Partial<MentorForMatch>): MentorForMatch => ({
  id: 'm', careerAreas: [], expertise: null, activeMenteeCount: 0, ...over,
});

describe('scoreMentor', () => {
  it('deterministic: exact interest<->career_area overlap, score = count', () => {
    const r = scoreMentor(
      { interests: ['Finance', 'Leadership'], careerGoals: [] },
      mentor({ id: 'a', careerAreas: ['Finance', 'Leadership', 'Education'] })
    );
    expect(r).toEqual({ mentorId: 'a', score: 2, kind: 'deterministic' });
  });
  it('is case/whitespace-insensitive for deterministic', () => {
    const r = scoreMentor(
      { interests: [' finance '], careerGoals: [] },
      mentor({ id: 'a', careerAreas: ['Finance'] })
    );
    expect(r.kind).toBe('deterministic');
    expect(r.score).toBe(1);
  });
  it('soft: token overlap when no career-area match', () => {
    const r = scoreMentor(
      { interests: ['Something'], careerGoals: ['launch a startup'] },
      mentor({ id: 'a', careerAreas: [], expertise: 'Startup coaching and growth' })
    );
    expect(r.kind).toBe('soft');
    expect(r.score).toBeGreaterThanOrEqual(1);
  });
  it('none: no overlap at all', () => {
    const r = scoreMentor(
      { interests: ['Finance'], careerGoals: ['buy a house'] },
      mentor({ id: 'a', careerAreas: ['Healthcare'], expertise: 'nursing' })
    );
    expect(r).toEqual({ mentorId: 'a', score: 0, kind: 'none' });
  });
  it('handles empty arrays and null expertise without crashing', () => {
    const r = scoreMentor({ interests: [], careerGoals: [] }, mentor({ id: 'a' }));
    expect(r.kind).toBe('none');
  });
});

describe('rankMentors', () => {
  it('ranks deterministic above soft above none', () => {
    const ranked = rankMentors(
      { interests: ['Finance'], careerGoals: ['startup'] },
      [
        mentor({ id: 'none', careerAreas: ['Healthcare'], expertise: 'nursing' }),
        mentor({ id: 'soft', careerAreas: [], expertise: 'startup advisor' }),
        mentor({ id: 'det', careerAreas: ['Finance'] }),
      ]
    );
    expect(ranked.map((r) => r.mentorId)).toEqual(['det', 'soft', 'none']);
  });
  it('tiebreaks equal scores by fewer active mentees', () => {
    const ranked = rankMentors(
      { interests: ['Finance'], careerGoals: [] },
      [
        mentor({ id: 'busy', careerAreas: ['Finance'], activeMenteeCount: 5 }),
        mentor({ id: 'free', careerAreas: ['Finance'], activeMenteeCount: 0 }),
      ]
    );
    expect(ranked[0].mentorId).toBe('free');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/matching.test.ts`
Expected: FAIL — cannot resolve `./matching`.

- [ ] **Step 3: Write the engine**

Create `src/lib/matching.ts`:
```ts
export type MenteeForMatch = { interests: string[]; careerGoals: string[] };
export type MentorForMatch = {
  id: string;
  careerAreas: string[];
  expertise: string | null;
  activeMenteeCount: number;
};
export type MatchKind = 'deterministic' | 'soft' | 'none';
export type MentorScore = { mentorId: string; score: number; kind: MatchKind };

function normSet(arr: string[]): Set<string> {
  return new Set(arr.map((s) => s.trim().toLowerCase()).filter(Boolean));
}

function tokenSet(values: string[]): Set<string> {
  const out = new Set<string>();
  for (const v of values) {
    for (const t of v.toLowerCase().split(/[^a-z0-9]+/)) {
      if (t.length > 1) out.add(t);
    }
  }
  return out;
}

function intersectionCount(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n;
}

export function scoreMentor(
  mentee: MenteeForMatch,
  mentor: MentorForMatch
): MentorScore {
  const det = intersectionCount(normSet(mentee.interests), normSet(mentor.careerAreas));
  if (det > 0) return { mentorId: mentor.id, score: det, kind: 'deterministic' };

  const menteeTokens = tokenSet([...mentee.interests, ...mentee.careerGoals]);
  const mentorTokens = tokenSet([
    ...mentor.careerAreas,
    ...(mentor.expertise ? [mentor.expertise] : []),
  ]);
  const soft = intersectionCount(menteeTokens, mentorTokens);
  if (soft > 0) return { mentorId: mentor.id, score: soft, kind: 'soft' };

  return { mentorId: mentor.id, score: 0, kind: 'none' };
}

const KIND_RANK: Record<MatchKind, number> = { deterministic: 2, soft: 1, none: 0 };

export function rankMentors(
  mentee: MenteeForMatch,
  mentors: MentorForMatch[]
): MentorScore[] {
  const counts = new Map(mentors.map((m) => [m.id, m.activeMenteeCount]));
  return mentors
    .map((m) => scoreMentor(mentee, m))
    .sort((a, b) => {
      if (KIND_RANK[b.kind] !== KIND_RANK[a.kind]) {
        return KIND_RANK[b.kind] - KIND_RANK[a.kind];
      }
      if (b.score !== a.score) return b.score - a.score;
      return (counts.get(a.mentorId) ?? 0) - (counts.get(b.mentorId) ?? 0);
    });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/matching.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/matching.ts src/lib/matching.test.ts
git commit -m "Add pure mentor matching engine (deterministic + soft) with tests"
```

---

### Task 3: Matching service (`autoMatchMentee`)

**Files:**
- Create: `src/lib/matching-service.ts`

**Interfaces:**
- Consumes: `rankMentors`, `MatchKind`, `MentorForMatch` from `./matching`; `createAdminClient` from `./supabase/admin`; `getMenteeAccess` from `./access`.
- Produces: `type AutoMatchResult = { matched: boolean; mentorId?: string; kind?: MatchKind; reason?: 'not_mentee' | 'not_paid' | 'already_matched' | 'no_candidate' | 'error' }`; `async autoMatchMentee(menteeId: string): Promise<AutoMatchResult>`.

- [ ] **Step 1: Write the service**

Create `src/lib/matching-service.ts`:
```ts
import { createAdminClient } from './supabase/admin';
import { getMenteeAccess } from './access';
import { rankMentors, type MatchKind, type MentorForMatch } from './matching';

export type AutoMatchResult = {
  matched: boolean;
  mentorId?: string;
  kind?: MatchKind;
  reason?: 'not_mentee' | 'not_paid' | 'already_matched' | 'no_candidate' | 'error';
};

export async function autoMatchMentee(menteeId: string): Promise<AutoMatchResult> {
  try {
    const admin = createAdminClient();

    const { data: mentee } = await admin
      .from('user_profiles')
      .select('role, interests, career_goals')
      .eq('id', menteeId)
      .single();

    if (!mentee || mentee.role !== 'mentee') {
      return { matched: false, reason: 'not_mentee' };
    }

    const access = await getMenteeAccess(menteeId);
    if (!access.hasAccess) {
      return { matched: false, reason: 'not_paid' };
    }

    const { data: existing } = await admin
      .from('mentorships')
      .select('id')
      .eq('mentee_id', menteeId)
      .eq('status', 'active')
      .maybeSingle();
    if (existing) {
      return { matched: false, reason: 'already_matched' };
    }

    const { data: mentorRows } = await admin
      .from('user_profiles')
      .select('id, career_areas, expertise')
      .eq('role', 'mentor');

    const { data: activeMs } = await admin
      .from('mentorships')
      .select('mentor_id')
      .eq('status', 'active');

    const counts: Record<string, number> = {};
    (activeMs ?? []).forEach((m) => {
      counts[m.mentor_id] = (counts[m.mentor_id] ?? 0) + 1;
    });

    const mentors: MentorForMatch[] = (mentorRows ?? []).map((m) => ({
      id: m.id,
      careerAreas: m.career_areas ?? [],
      expertise: m.expertise ?? null,
      activeMenteeCount: counts[m.id] ?? 0,
    }));

    const ranked = rankMentors(
      { interests: mentee.interests ?? [], careerGoals: mentee.career_goals ?? [] },
      mentors
    );
    const best = ranked.find((r) => r.kind !== 'none');
    if (!best) {
      return { matched: false, reason: 'no_candidate' };
    }

    const { error } = await admin.from('mentorships').insert({
      mentor_id: best.mentorId,
      mentee_id: menteeId,
      status: 'active',
    });
    if (error) {
      console.error('[autoMatchMentee] insert', error);
      return { matched: false, reason: 'error' };
    }

    return { matched: true, mentorId: best.mentorId, kind: best.kind };
  } catch (error) {
    console.error('[autoMatchMentee]', error);
    return { matched: false, reason: 'error' };
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/matching-service.ts
git commit -m "Add autoMatchMentee service (role + paid + match, fail-safe)"
```

---

### Task 4: Admin matching API — run-all route + reassign

**Files:**
- Create: `src/app/api/admin/matches/auto/route.ts`
- Modify: `src/app/api/admin/matches/route.ts`

**Interfaces:**
- Consumes: `autoMatchMentee` from `@/lib/matching-service`.
- Produces: `POST /api/admin/matches/auto` → admin-only; `200 { summary: { matched, not_mentee, not_paid, already_matched, no_candidate, error } }`. Extended `PATCH /api/admin/matches` accepting `{ id, mentor_id }` for reassign.

- [ ] **Step 1: Write the run-all route**

Create `src/app/api/admin/matches/auto/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { autoMatchMentee } from '@/lib/matching-service';

export async function POST() {
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
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: mentees } = await admin
    .from('user_profiles')
    .select('id')
    .eq('role', 'mentee');

  const summary = {
    matched: 0,
    not_mentee: 0,
    not_paid: 0,
    already_matched: 0,
    no_candidate: 0,
    error: 0,
  };
  for (const m of mentees ?? []) {
    const r = await autoMatchMentee(m.id);
    if (r.matched) summary.matched++;
    else if (r.reason) summary[r.reason]++;
  }

  return NextResponse.json({ summary });
}
```

- [ ] **Step 2: Extend PATCH for reassign**

In `src/app/api/admin/matches/route.ts`, add a reassign schema near the existing `updateMatchSchema`:
```ts
const reassignSchema = z.object({
  id: z.string().uuid(),
  mentor_id: z.string().uuid(),
});
```
Then at the TOP of the existing `PATCH` handler's body — after the admin check and after `const body = await req.json();`, before it parses `updateMatchSchema` — insert a reassign branch:
```ts
    const reassign = reassignSchema.safeParse(body);
    if (reassign.success) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('mentorships')
        .update({ mentor_id: reassign.data.mentor_id })
        .eq('id', reassign.data.id)
        .select()
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ match: data });
    }
```
(Read the existing PATCH to place this exactly: it must run before the `updateMatchSchema` parse so a `{id, mentor_id}` body is treated as a reassign and a `{id, status}` body still falls through to the existing status update. Keep the existing status-update code unchanged. `createClient` is already imported in this file; reuse it.)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Verify both are admin-gated (dev server running)**

Run (PowerShell), expecting `401` unauthenticated for each:
```
powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3000/api/admin/matches/auto -Method POST -UseBasicParsing).StatusCode } catch { $_.Exception.Response.StatusCode.value__ }"
```
Expected: `401`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/admin/matches/auto/route.ts" "src/app/api/admin/matches/route.ts"
git commit -m "Add admin run-auto-match route + reassign PATCH"
```

---

### Task 5: Stripe webhook trigger

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts`

**Interfaces:**
- Consumes: `autoMatchMentee` from `@/lib/matching-service`.

- [ ] **Step 1: Wire the trigger**

In `src/app/api/webhooks/stripe/route.ts`, add the import at the top:
```ts
import { autoMatchMentee } from '@/lib/matching-service';
```
Find where a subscription is marked current/active for a user (the code that sets `is_current: true` using the `userId` from the Stripe metadata). Immediately AFTER that subscription write succeeds, add a fire-and-forget auto-match (it self-guards on role + paid, so it is safe to call for any subscriber):
```ts
      // Once a mentee's subscription is active, try to auto-match them.
      void autoMatchMentee(userId).catch((e) =>
        console.error('[webhook auto-match]', e)
      );
```
Use the variable the webhook already holds for the subscriber's user id (e.g. `userId` from `stripeSub.metadata` / the subscription row). Do not change any other webhook behavior.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/webhooks/stripe/route.ts"
git commit -m "Auto-match a mentee when their subscription becomes active (webhook)"
```

---

### Task 6: Mentor career-areas on the profile page

**Files:**
- Modify: `src/app/dashboard/mentor/profile/page.tsx`

**Interfaces:**
- Consumes: `INTEREST_CATEGORIES` from `@/lib/onboarding-options`.

- [ ] **Step 1: Add the career-areas selector**

Read `src/app/dashboard/mentor/profile/page.tsx` (a client form with `formData` state loaded from `user_profiles` and saved via `supabase.from('user_profiles').update({...})`). Make these changes:
1. Add the import: `import { INTEREST_CATEGORIES } from '@/lib/onboarding-options';`
2. Add state: `const [careerAreas, setCareerAreas] = useState<string[]>([]);`
3. In the profile load effect, after the row is fetched, add: `setCareerAreas(data.career_areas ?? []);`
4. Add a toggle handler:
```tsx
  const toggleCareerArea = (value: string) =>
    setCareerAreas((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
```
5. In the submit handler's `update({...})` object, add `career_areas: careerAreas,`.
6. In the form JSX (near the Expertise field), add a labeled section that renders a chip button per `INTEREST_CATEGORIES` entry, highlighting selected ones and calling `toggleCareerArea`. Example:
```tsx
        <div className={styles.field}>
          <label>Career areas (for matching)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {INTEREST_CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => toggleCareerArea(c)}
                aria-pressed={careerAreas.includes(c)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 9999,
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: careerAreas.includes(c) ? 'var(--brand-700)' : 'var(--surface-1)',
                  color: careerAreas.includes(c) ? '#fff' : 'var(--text-primary)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
```
Keep all existing fields and behavior unchanged.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/dashboard/mentor/profile/page.tsx"
git commit -m "Let mentors set structured career areas on their profile"
```

---

### Task 7: Admin matches page — run button + reassign

**Files:**
- Modify: `src/app/dashboard/admin/matches/page.tsx`

**Interfaces:**
- Consumes: `POST /api/admin/matches/auto` → `{ summary }`; `PATCH /api/admin/matches` with `{ id, mentor_id }`; mentor list from `GET /api/admin/users` (returns `{ users: [...] }` — filter `role === 'mentor'`).

- [ ] **Step 1: Add the run-auto-match button + reassign control**

Read `src/app/dashboard/admin/matches/page.tsx` (a client page that already lists matches from `GET /api/admin/matches`). Make these changes, matching the file's existing patterns:
1. Fetch mentors for the reassign dropdown: on mount, `GET /api/admin/users`, keep those with `role === 'mentor'` as `{ id, full_name }` options in state.
2. Add a "Run auto-match" button that `POST`s to `/api/admin/matches/auto`, then shows the returned `summary` (e.g. "Matched 3 · 2 already matched · 1 no candidate · 1 not paid") and refreshes the matches list.
3. For each match row, add a mentor `<select>` seeded to the current `mentor_id`; on change, `PATCH /api/admin/matches` with `{ id: match.id, mentor_id: <selected> }`, then refresh the list.
4. Surface request errors inline; don't crash on an empty mentor list.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/dashboard/admin/matches/page.tsx"
git commit -m "Admin matches page: run auto-match + reassign mentor"
```

---

### Task 8: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Unit tests**

Run: `npx vitest run`
Expected: all tests PASS (existing + the new matching tests).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build (stop the dev server first)**

Stop the dev server, clear `.next`, then `npm run build`. Expected: "Compiled successfully", all pages generated. Restart `npm run dev` after.

- [ ] **Step 4: Manual verification against the live DB**

Using `node scripts/apply-sql.mjs "<SQL>"` to set up state, and an admin login in the browser:
  - Give a test mentor `career_areas` that overlap a test mentee's `interests`, and make the mentee paid-active (an `is_current`, `status='active'` subscription on a paid plan) with no active mentorship.
  - Click **Run auto-match** on `/dashboard/admin/matches`; confirm the summary reports `matched >= 1` and that a `status='active'` mentorship row now links that mentee to the overlapping mentor (verify via the Management API).
  - Confirm a free/unpaid mentee is counted under `not_paid` and an already-matched mentee under `already_matched`.
  - Use the reassign `<select>` to change a match's mentor; confirm `mentorships.mentor_id` updated.

- [ ] **Step 5: Final commit (if verification required tweaks)**

```bash
git add -A
git commit -m "Verify automatic matching end to end"
```

---

## Self-Review

**Spec coverage:**
- `career_areas` column → Task 1. ✓
- Engine (deterministic/soft/none, rank, tiebreak) → Task 2. ✓
- `autoMatchMentee` (role + paid + already-matched + rank + create, fail-safe) → Task 3. ✓
- Admin run-all route + reassign → Task 4. ✓
- Webhook trigger → Task 5. ✓
- Mentor career-areas UI → Task 6. ✓
- Admin matches page (run button + reassign) → Task 7. ✓
- Paid-only via `getMenteeAccess`; role guard added (`not_mentee`) → Task 3. ✓
- Tests → Task 2 (unit) + Task 8 (build + manual). ✓

**Placeholder scan:** none — every code step has concrete code; the two UI modify-tasks (6, 7) give exact imports, state, handlers, and request shapes against the existing files.

**Type consistency:** `MenteeForMatch`/`MentorForMatch`/`MatchKind`/`MentorScore` defined in Task 2, consumed unchanged in Task 3; `autoMatchMentee(menteeId): Promise<AutoMatchResult>` with reasons `not_mentee|not_paid|already_matched|no_candidate|error` produced in Task 3, consumed by Task 4's summary keys and Task 5; `POST /api/admin/matches/auto` → `{ summary }` and `PATCH {id, mentor_id}` produced in Task 4, consumed in Task 7.
