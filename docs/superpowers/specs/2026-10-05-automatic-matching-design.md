# Automatic Mentor–Mentee Matching — Design

**Date:** 2026-10-05
**Status:** Approved (pending spec review)
**Roadmap item:** Launch — "Automatic matching from mentor career areas and expertise (deterministic and soft), paid mentees only."

## Goal

Automatically pair a paid-active mentee with the best-fitting mentor, creating an
active mentorship. Matching ranks mentors by a deterministic rule (exact overlap
between the mentee's interests and the mentor's career areas), falling back to a
soft rule (token overlap across interests/goals vs career-areas/expertise), with
a load-balancing tiebreak. The pairing runs from an admin action now and from the
Stripe webhook once real payments are live; an admin can reassign any match.

## Scope / decisions

- **Paid mentees only:** a mentee is eligible only when `getMenteeAccess(menteeId).hasAccess` is true (active paid plan). Free / unpaid mentees are never auto-matched.
- **One active mentorship per mentee:** skip a mentee who already has a `status='active'` mentorship.
- **No hard mentor capacity cap** — load-balancing tiebreak (prefer mentors with fewer active mentees).
- **No overlap → no auto-match:** if no mentor has any deterministic or soft overlap, leave the mentee unmatched (admin matches them manually). Never force a zero-overlap pairing.
- **Mentors set career areas on their profile page** (no mentor onboarding gate); mentors with none set simply won't deterministically match.
- **Out of scope:** changing subscription/Stripe flows; a mentee-facing "pick a mentor" UI; mentor consent/accept step; notifying the parties (could be added later via the existing notification system — noted, not built).

## Data model (migration, Management API)

Add to `public.user_profiles`: `career_areas text[]`. No RLS change (users update
their own row; the mentor profile page already updates user_profiles). Matches are
rows in the existing `mentorships` table (`mentor_id, mentee_id, status`).

## Components

### 1. Matching engine — `src/lib/matching.ts` (pure, unit-tested)

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

export function scoreMentor(mentee: MenteeForMatch, mentor: MentorForMatch): MentorScore;
export function rankMentors(mentee: MenteeForMatch, mentors: MentorForMatch[]): MentorScore[];
```

- Normalize all values with lowercase + trim before comparing.
- **Deterministic:** `score` = size of the exact intersection of `mentee.interests` and `mentor.careerAreas`. If > 0 → `kind: 'deterministic'`.
- **Soft (only if deterministic score is 0):** tokenize `mentee.interests + careerGoals` and `mentor.careerAreas + expertise` into words (split on non-alphanumerics), `score` = count of shared tokens. If > 0 → `kind: 'soft'`.
- Else `kind: 'none'`, `score: 0`.
- `rankMentors` returns all mentors sorted best-first by: kind rank (deterministic > soft > none), then `score` desc, then `activeMenteeCount` asc (load-balance). Ties beyond that are stable.

### 2. Matching service — `src/lib/matching-service.ts`

`async autoMatchMentee(menteeId: string): Promise<{ matched: boolean; mentorId?: string; kind?: MatchKind; reason?: 'not_paid' | 'already_matched' | 'no_candidate' | 'error' }>`
Using the service-role client, and fail-safe (any throw → `{ matched: false, reason: 'error' }`, logged):
1. `getMenteeAccess(menteeId)` — if not `hasAccess` → `{ matched:false, reason:'not_paid' }`.
2. Query `mentorships` for `mentee_id = menteeId AND status='active'` — if one exists → `{ matched:false, reason:'already_matched' }`.
3. Load the mentee's `interests` + `career_goals`.
4. Load mentor candidates: `user_profiles` where `role='mentor'` → `{ id, career_areas, expertise }`; and active-mentee counts from `mentorships` where `status='active'` grouped by `mentor_id`.
5. `rankMentors(...)`; take the first with `kind !== 'none'`. If none → `{ matched:false, reason:'no_candidate' }`.
6. `createMentorship({ mentor_id, mentee_id })` (status active). Return `{ matched:true, mentorId, kind }`.

### 3. Admin "Run auto-match" — `POST /api/admin/matches/auto`
Admin-only. Lists all `role='mentee'` user ids, calls `autoMatchMentee` for each
(which internally skips not-paid / already-matched), and returns a summary:
`{ matched: number, skipped: { not_paid, already_matched, no_candidate, error } }`.
A "Run auto-match" button on `/dashboard/admin/matches` posts here and shows the summary.

### 4. Stripe webhook trigger
In `src/app/api/webhooks/stripe/route.ts`, after a subscription is marked active
(`is_current`) for a user, if that user's role is `mentee`, call
`autoMatchMentee(userId)` fire-and-forget (errors caught/logged). Stub-ready: fires
once real price IDs/payments exist.

### 5. Admin reassign
The admin matches route already has a `PATCH` for `{ id, status }`. Extend it to
also accept a reassign body `{ id: uuid, mentor_id: uuid }` → update that
mentorship's `mentor_id` (admin-only). PATCH branches on which body shape it gets.
On the matches page, a mentor `<select>` per match lets the admin reassign.

### 6. Mentor career-areas UI
On the mentor profile page (`src/app/dashboard/mentor/profile/page.tsx`), add a
chip selector from `INTEREST_CATEGORIES` (reuse `@/lib/onboarding-options`) bound to
`career_areas`, saved alongside the existing profile update.

## Data flow

```
admin "Run auto-match" ─► POST /api/admin/matches/auto ─► for each mentee: autoMatchMentee
stripe webhook (sub active, mentee) ─► autoMatchMentee(userId)
autoMatchMentee ─► paid? ─► already matched? ─► rankMentors(mentee, mentors) ─► create mentorship (top, kind!=none)
admin reassign ─► PATCH /api/admin/matches { id, mentor_id } ─► update mentorships.mentor_id
```

## Error handling

- `autoMatchMentee` never throws (callable safely from the webhook + loop); on error returns `{ matched:false, reason:'error' }` and logs.
- Admin routes: 401 unauth, 403 non-admin, 400 bad input.
- The engine is pure and total (handles empty arrays, null expertise).

## Testing

- **Unit (pure `scoreMentor` / `rankMentors`):** deterministic overlap scores by count; deterministic beats soft; soft fallback on token overlap; no overlap → none; ranking order (kind, then score, then activeMenteeCount); normalization (case/trim); empty interests/careerAreas and null expertise.
- **Manual (live DB):** give a test mentor `career_areas` overlapping a paid test mentee's interests; run the admin "Run auto-match"; confirm an active mentorship is created with that mentor, the summary counts are right, a free/unpaid mentee is skipped (`not_paid`), an already-matched mentee is skipped, and reassign changes `mentor_id`. Verify via the Management API.
