# Mentor Availability + Booking Requests — Design

**Date:** 2026-10-05
**Status:** Approved for planning

## Goal

Mentors publish concrete open time slots. An assigned, paid mentee requests a
slot. The mentor approves it — which creates a real session — or declines it.
All parties are kept informed through the existing notification system.

External calendar / Calendly sync remains post-launch and is out of scope here.

## Architecture

A single new table, `mentor_availability`, holds published slots and carries a
small state machine. Approving a request reuses the existing `createSession(...)`
server action, so the resulting meeting lives in the existing `sessions` table
and both dashboards' existing Sessions pages — there is no parallel meeting list.

Mentor-side writes use the user-scoped Supabase client guarded by an RLS policy
(`mentor_id = auth.uid()`). Mentee-side writes (requesting a slot) go through a
server action that uses the admin (service-role) client **after** explicitly
verifying the mentee has an active mentorship with the slot's mentor and passes
the paid-access gate — mirroring the existing `autoMatchMentee` pattern.

## Data Model

New table `public.mentor_availability`:

| column | type | notes |
|---|---|---|
| `id` | uuid pk default gen_random_uuid() | |
| `mentor_id` | uuid not null → user_profiles(id) | slot owner |
| `starts_at` | timestamptz not null | slot start |
| `ends_at` | timestamptz not null | slot end |
| `status` | text not null default 'open' | `open` \| `pending` \| `booked` |
| `requested_by` | uuid null → user_profiles(id) | set while `pending` |
| `request_note` | text null | optional mentee note while `pending` |
| `session_id` | uuid null → sessions(id) | set when `booked` |
| `created_at` | timestamptz not null default now() | |
| `updated_at` | timestamptz not null default now() | |

Indexes on `mentor_id`, `requested_by`, and `status`. A `check` constraint
enforces `ends_at > starts_at` and `status in ('open','pending','booked')`.

### State machine

- `open` — published and visible to the mentor's active mentees; requestable.
- `pending` — a mentee has requested it (`requested_by`, `request_note` set);
  awaiting the mentor.
- `booked` — the mentor approved it; `session_id` links to the created session.

Transitions:

- mentor creates slot → `open`; notify the mentor's active mentees.
- mentee requests an `open` slot → `pending` (`requested_by`, note); notify mentor.
- mentor approves a `pending` slot → `booked` (create session, set `session_id`);
  notify mentee.
- mentor declines a `pending` slot → `open` (clear `requested_by`/`request_note`);
  notify mentee.
- mentor deletes a slot that is not `booked` → row removed.

**Launch constraint (first-come):** a slot holds at most one pending request at a
time. Once one mentee requests an `open` slot it becomes `pending` and is no
longer requestable by others until the mentor declines it.

## Access Rules

- **Mentor writes** (create / delete / approve / decline): user-scoped client;
  RLS policy `mentor_id = auth.uid()` on the table authorizes the write.
- **Mentee visibility**: RLS `SELECT` policy — a mentee may read a slot only when
  an active mentorship exists linking that mentee to the slot's `mentor_id`.
- **Mentee request**: server action verifies (a) an active mentorship with the
  slot's mentor and (b) `getMenteeAccess(menteeId).hasAccess` (the existing paid
  gate that already protects sessions), then writes via the admin client. Free or
  unmatched mentees cannot request.

## Components

1. `supabase/migrations/0010_mentor_availability.sql` — table, indexes, check
   constraint, RLS policies. Applied live via `node scripts/apply-sql.mjs`.
2. `src/lib/availability.ts` — **pure** logic, no I/O:
   - `validateSlot({ startsAt, endsAt, now })` → returns an error string or null
     (rejects end ≤ start and start in the past).
   - `canRequest(slot)` → slot.status === 'open'.
   - `canApprove(slot)` / `canDecline(slot)` → slot.status === 'pending'.
   - `canDelete(slot)` → slot.status !== 'booked'.
3. `src/app/dashboard/availability/actions.ts` — server actions:
   `createSlot`, `deleteSlot`, `requestSlot`, `approveRequest`, `declineRequest`.
   `approveRequest` calls the existing `createSession(...)` with the slot's
   `starts_at`/`ends_at` and the mentor-supplied meeting type/link/title, then
   sets the slot `booked` with `session_id`.
4. `src/app/dashboard/mentor/availability/page.tsx` (+ client component) — add
   dated slots (date + start/end time), list own slots grouped by status, and a
   "Pending requests" section with Approve (collects meeting type, optional link,
   title) and Decline actions.
5. `src/app/dashboard/mentee/availability/page.tsx` (+ client component) — the
   mentee's mentor's `open` slots with a Request action (optional note), plus the
   status of the mentee's own pending/booked requests.
6. `src/components/dashboard/DashboardSidebar.tsx` — "Availability" links for the
   mentor and mentee roles.
7. `src/lib/notifications.ts` — add notification types `availability_published`,
   `booking_requested`, `booking_approved`, `booking_declined`.

## Notifications

- Publish a slot → `availability_published` to each active mentee of the mentor.
- Request a slot → `booking_requested` to the mentor.
- Approve → `booking_approved` to the mentee (plus the existing
  `session_scheduled` emitted by `createSession`).
- Decline → `booking_declined` to the mentee.

## Error Handling

- Slot validation (end > start, not in the past) runs in `validateSlot` and is
  enforced again by the DB check constraint.
- Request action returns a clear error when there is no active mentorship, the
  mentee fails the paid gate, or the slot is no longer `open`.
- Approve/decline return a clear error when the slot is not `pending` (e.g. a
  race where it was already handled).
- Session creation failure inside `approveRequest` aborts the approval (the slot
  stays `pending`) and surfaces the error.

## Testing

Vitest unit tests on the pure `src/lib/availability.ts` helpers: `validateSlot`
(valid slot, end ≤ start, start in the past), and `canRequest` / `canApprove` /
`canDecline` / `canDelete` across each status. Server actions are thin wrappers
over these guards plus Supabase calls and the existing `createSession`; they are
verified by the per-task and whole-branch code reviews.

## Out of Scope (post-launch)

- Recurring / weekly availability templates.
- External calendar or Calendly sync.
- Multiple competing requests per slot (launch is first-come; one pending request
  locks a slot until declined).
