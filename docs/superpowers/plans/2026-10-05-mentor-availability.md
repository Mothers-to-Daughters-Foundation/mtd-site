# Mentor Availability + Booking Requests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mentors publish concrete open time slots; an assigned, paid mentee requests one; the mentor approves it (creating a real session) or declines it, with notifications throughout.

**Architecture:** One new table `public.mentor_availability` carries a small state machine (`open` → `pending` → `booked`). Approval reuses the existing `createSession(...)` server action so meetings live in the existing `sessions` table and Sessions pages. Mentor writes use the user-scoped Supabase client under an RLS policy (`mentor_id = auth.uid()`); mentee requests go through a server action that uses the admin (service-role) client after verifying an active mentorship and the paid-access gate.

**Tech Stack:** Next.js 14 App Router (server components + server actions), TypeScript, Supabase (`@supabase/ssr` server client, service-role admin client), PostgREST + RLS, vitest.

## Global Constraints

- Slot `status` is exactly one of `'open'`, `'pending'`, `'booked'`. Transitions: create→`open`; mentee request `open`→`pending`; mentor approve `pending`→`booked`; mentor decline `pending`→`open`.
- **First-come:** a slot holds at most one pending request. A mentee may request only a slot whose status is `open`; requesting sets it `pending` and locks out others until declined.
- A mentee may request a slot **only** when (a) an active mentorship links the mentee to the slot's `mentor_id` AND (b) `getMenteeAccess(menteeId).hasAccess` is true (the existing paid gate). Free or unmatched mentees cannot request.
- Approval reuses the existing `createSession(...)` — never build a parallel meeting list.
- Mentor-side writes (create/delete/approve/decline) use the user-scoped server client under RLS `mentor_id = (select auth.uid())`. Mentee request writes use the admin client after explicit verification (mirroring `src/lib/matching-service.ts`).
- Never print secrets. Migrations are applied live with `node scripts/apply-sql.mjs <file.sql>` (reads `SUPABASE_ACCESS_TOKEN` from `.env.local`).
- Notifications in the mentee→mentor direction (`booking_requested`) must be inserted with the admin client inside the request action — RLS blocks a mentee from inserting a notification for another user. Mentor→mentee notifications may use `notifyUser`/`notifyUsers` (allowed by the existing `"Users create legitimate notifications"` policy).

---

### Task 1: Database migration — `mentor_availability` table + RLS

**Files:**
- Create: `supabase/migrations/0010_mentor_availability.sql`

**Interfaces:**
- Produces: table `public.mentor_availability` with columns `id, mentor_id, starts_at, ends_at, status, requested_by, request_note, session_id, created_at, updated_at`. All later tasks read/write this table.

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/0010_mentor_availability.sql`:

```sql
-- Mentor availability slots + booking-request state machine.
-- status: 'open' -> 'pending' (mentee requested) -> 'booked' (mentor approved; session created).
-- Decline returns 'pending' -> 'open'. Mentor writes guarded by RLS; mentee requests via admin client.

create table if not exists public.mentor_availability (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.user_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'open',
  requested_by uuid references public.user_profiles(id) on delete set null,
  request_note text,
  session_id uuid references public.sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mentor_availability_time_order check (ends_at > starts_at),
  constraint mentor_availability_status check (status in ('open','pending','booked'))
);

create index if not exists mentor_availability_mentor_id_idx on public.mentor_availability (mentor_id);
create index if not exists mentor_availability_requested_by_idx on public.mentor_availability (requested_by);
create index if not exists mentor_availability_status_idx on public.mentor_availability (status);

alter table public.mentor_availability enable row level security;

-- Admins manage everything.
create policy "Admins manage availability" on public.mentor_availability
  for all to authenticated
  using ((select get_user_role()) = 'admin')
  with check ((select get_user_role()) = 'admin');

-- Mentors fully manage their own slots.
create policy "Mentors manage own availability" on public.mentor_availability
  for all to authenticated
  using (mentor_id = (select auth.uid()))
  with check (mentor_id = (select auth.uid()));

-- Mentees may read slots of a mentor they have an active mentorship with.
create policy "Mentees view their mentor availability" on public.mentor_availability
  for select to authenticated
  using (exists (
    select 1 from public.mentorships m
    where m.mentor_id = mentor_availability.mentor_id
      and m.mentee_id = (select auth.uid())
      and m.status = 'active'::mentorship_status
  ));
```

- [ ] **Step 2: Apply the migration live**

Run: `node scripts/apply-sql.mjs supabase/migrations/0010_mentor_availability.sql`
Expected: a JSON array response (no `HTTP 4xx/5xx`). A `[]` or `[{...}]` body means success.

- [ ] **Step 3: Verify the table exists**

Run: `node scripts/apply-sql.mjs "select column_name, data_type from information_schema.columns where table_name = 'mentor_availability' order by ordinal_position;"`
Expected: rows listing all 10 columns (`id, mentor_id, starts_at, ends_at, status, requested_by, request_note, session_id, created_at, updated_at`).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0010_mentor_availability.sql
git commit -m "Add mentor_availability table + RLS for booking requests"
```

---

### Task 2: Pure availability logic + unit tests

**Files:**
- Create: `src/lib/availability.ts`
- Test: `src/lib/availability.test.ts`

**Interfaces:**
- Produces:
  - `type SlotStatus = 'open' | 'pending' | 'booked'`
  - `type AvailabilitySlot = { id: string; mentorId: string; startsAt: string; endsAt: string; status: SlotStatus; requestedBy: string | null; requestNote: string | null; sessionId: string | null }`
  - `validateSlot(input: { startsAt: string; endsAt: string; now?: Date }): string | null` — returns an error message, or `null` when valid.
  - `canRequest(slot: { status: SlotStatus }): boolean`
  - `canApprove(slot: { status: SlotStatus }): boolean`
  - `canDecline(slot: { status: SlotStatus }): boolean`
  - `canDelete(slot: { status: SlotStatus }): boolean`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/availability.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  validateSlot,
  canRequest,
  canApprove,
  canDecline,
  canDelete,
} from './availability';

const NOW = new Date('2026-10-05T12:00:00.000Z');

describe('validateSlot', () => {
  it('accepts a well-formed future slot', () => {
    expect(
      validateSlot({
        startsAt: '2026-10-06T14:00:00.000Z',
        endsAt: '2026-10-06T15:00:00.000Z',
        now: NOW,
      })
    ).toBeNull();
  });

  it('rejects end <= start', () => {
    expect(
      validateSlot({
        startsAt: '2026-10-06T15:00:00.000Z',
        endsAt: '2026-10-06T15:00:00.000Z',
        now: NOW,
      })
    ).toMatch(/later than the start/i);
  });

  it('rejects a start in the past', () => {
    expect(
      validateSlot({
        startsAt: '2026-10-04T14:00:00.000Z',
        endsAt: '2026-10-04T15:00:00.000Z',
        now: NOW,
      })
    ).toMatch(/past/i);
  });

  it('rejects an invalid date', () => {
    expect(
      validateSlot({ startsAt: 'not-a-date', endsAt: 'also-bad', now: NOW })
    ).toMatch(/invalid/i);
  });
});

describe('transition guards', () => {
  it('canRequest only when open', () => {
    expect(canRequest({ status: 'open' })).toBe(true);
    expect(canRequest({ status: 'pending' })).toBe(false);
    expect(canRequest({ status: 'booked' })).toBe(false);
  });

  it('canApprove / canDecline only when pending', () => {
    expect(canApprove({ status: 'pending' })).toBe(true);
    expect(canApprove({ status: 'open' })).toBe(false);
    expect(canDecline({ status: 'pending' })).toBe(true);
    expect(canDecline({ status: 'booked' })).toBe(false);
  });

  it('canDelete unless booked', () => {
    expect(canDelete({ status: 'open' })).toBe(true);
    expect(canDelete({ status: 'pending' })).toBe(true);
    expect(canDelete({ status: 'booked' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/availability.test.ts`
Expected: FAIL — cannot resolve `./availability` (module does not exist yet).

- [ ] **Step 3: Implement the module**

Create `src/lib/availability.ts`:

```ts
export type SlotStatus = 'open' | 'pending' | 'booked';

export type AvailabilitySlot = {
  id: string;
  mentorId: string;
  startsAt: string; // ISO timestamp
  endsAt: string; // ISO timestamp
  status: SlotStatus;
  requestedBy: string | null;
  requestNote: string | null;
  sessionId: string | null;
};

/**
 * Returns an error message if the slot times are invalid, or null when valid.
 * A valid slot has parseable dates, ends after it starts, and does not start
 * in the past.
 */
export function validateSlot(input: {
  startsAt: string;
  endsAt: string;
  now?: Date;
}): string | null {
  const start = new Date(input.startsAt);
  const end = new Date(input.endsAt);
  const now = input.now ?? new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Invalid date or time.';
  }
  if (end.getTime() <= start.getTime()) {
    return 'The end time must be later than the start time.';
  }
  if (start.getTime() < now.getTime()) {
    return 'The slot cannot start in the past.';
  }
  return null;
}

export function canRequest(slot: { status: SlotStatus }): boolean {
  return slot.status === 'open';
}

export function canApprove(slot: { status: SlotStatus }): boolean {
  return slot.status === 'pending';
}

export function canDecline(slot: { status: SlotStatus }): boolean {
  return slot.status === 'pending';
}

export function canDelete(slot: { status: SlotStatus }): boolean {
  return slot.status !== 'booked';
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/availability.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/availability.ts src/lib/availability.test.ts
git commit -m "Add pure availability logic (validation + transition guards) with tests"
```

---

### Task 3: Server actions + notification types

**Files:**
- Modify: `src/lib/notifications.ts` (add 4 notification types to the `NotificationType` union, after `"match"`)
- Create: `src/app/dashboard/availability/actions.ts`

**Interfaces:**
- Consumes:
  - From Task 2: `validateSlot`, `canRequest`, `canApprove`, `canDecline`, `canDelete`.
  - Existing `createAdminClient()` from `@/lib/supabase/admin`.
  - Existing server client `createClient()` from `@/lib/supabase/server`.
  - Existing `getMenteeAccess(userId)` from `@/lib/access` → `{ hasAccess: boolean; reason: ... }`.
  - Existing `createSession(data)` from `@/app/dashboard/sessions/actions` where `data` is `{ mentorship_id, mentor_id, mentee_id, title, description?, scheduled_start, scheduled_end, duration_minutes, timezone?, meeting_type, meeting_link?, location? }` and `meeting_type` is a `SessionType` from `@/lib/models/session`.
  - Existing `notifyUser(userId, type, title, message, relatedId?)` and `notifyUsers(userIds, type, title, message, relatedId?)` from `@/lib/notifications`.
- Produces (all return `Promise<{ ok: boolean; error?: string }>`):
  - `createSlot(input: { startsAt: string; endsAt: string })`
  - `deleteSlot(slotId: string)`
  - `requestSlot(slotId: string, note?: string)`
  - `approveRequest(input: { slotId: string; title: string; meetingType: SessionType; meetingLink?: string; description?: string })`
  - `declineRequest(slotId: string)`

- [ ] **Step 1: Add notification types**

In `src/lib/notifications.ts`, extend the `NotificationType` union. Change:

```ts
  // New notifications
  | "resource"
  | "subscription"
  | "match";
```

to:

```ts
  // New notifications
  | "resource"
  | "subscription"
  | "match"
  | "availability_published"
  | "booking_requested"
  | "booking_approved"
  | "booking_declined";
```

- [ ] **Step 2: Create the actions file**

Create `src/app/dashboard/availability/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMenteeAccess } from "@/lib/access";
import { notifyUser, notifyUsers } from "@/lib/notifications";
import { createSession } from "@/app/dashboard/sessions/actions";
import {
  validateSlot,
  canRequest,
  canApprove,
  canDecline,
  canDelete,
} from "@/lib/availability";
import type { SessionType } from "@/lib/models/session";

type Result = { ok: boolean; error?: string };

async function getUserAndRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null as string | null };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, role: (profile?.role as string | null) ?? null };
}

function revalidate() {
  revalidatePath("/dashboard/mentor/availability");
  revalidatePath("/dashboard/mentee/availability");
  revalidatePath("/dashboard/sessions");
}

/* ---------- Mentor: create a slot ---------- */
export async function createSlot(input: {
  startsAt: string;
  endsAt: string;
}): Promise<Result> {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (role !== "mentor") return { ok: false, error: "Only mentors can set availability." };

  const invalid = validateSlot({ startsAt: input.startsAt, endsAt: input.endsAt });
  if (invalid) return { ok: false, error: invalid };

  const { error } = await supabase.from("mentor_availability").insert({
    mentor_id: user.id,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    status: "open",
  });
  if (error) return { ok: false, error: error.message };

  // Notify the mentor's active mentees (mentor -> mentee notifications are RLS-allowed).
  const { data: mentorships } = await supabase
    .from("mentorships")
    .select("mentee_id")
    .eq("mentor_id", user.id)
    .eq("status", "active");
  const menteeIds = (mentorships ?? []).map((m) => m.mentee_id);
  if (menteeIds.length) {
    await notifyUsers(
      menteeIds,
      "availability_published",
      "New availability",
      "Your mentor added a new available time slot.",
    );
  }

  revalidate();
  return { ok: true };
}

/* ---------- Mentor: delete a non-booked slot ---------- */
export async function deleteSlot(slotId: string): Promise<Result> {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (role !== "mentor") return { ok: false, error: "Only mentors can delete availability." };

  const { data: slot } = await supabase
    .from("mentor_availability")
    .select("status")
    .eq("id", slotId)
    .eq("mentor_id", user.id)
    .single();
  if (!slot) return { ok: false, error: "Slot not found." };
  if (!canDelete(slot)) return { ok: false, error: "A booked slot cannot be deleted." };

  const { error } = await supabase
    .from("mentor_availability")
    .delete()
    .eq("id", slotId)
    .eq("mentor_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidate();
  return { ok: true };
}

/* ---------- Mentee: request an open slot ---------- */
export async function requestSlot(slotId: string, note?: string): Promise<Result> {
  const { user } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: slot } = await admin
    .from("mentor_availability")
    .select("id, mentor_id, status")
    .eq("id", slotId)
    .single();
  if (!slot || !canRequest(slot)) {
    return { ok: false, error: "This slot is no longer available." };
  }

  const { data: mentorship } = await admin
    .from("mentorships")
    .select("id")
    .eq("mentor_id", slot.mentor_id)
    .eq("mentee_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!mentorship) {
    return { ok: false, error: "You can only request time from your assigned mentor." };
  }

  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return { ok: false, error: "An active subscription is required to request a session." };
  }

  // Guard the race with .eq('status','open') so a second requester cannot win.
  const { data: updated, error } = await admin
    .from("mentor_availability")
    .update({
      status: "pending",
      requested_by: user.id,
      request_note: note?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slotId)
    .eq("status", "open")
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!updated || updated.length === 0) {
    return { ok: false, error: "This slot was just taken." };
  }

  // Notify the mentor via admin client (mentee -> mentor notification is RLS-blocked otherwise).
  await admin.from("notifications").insert({
    user_id: slot.mentor_id,
    type: "booking_requested",
    title: "New booking request",
    message: "A mentee requested one of your available time slots.",
    related_id: slotId,
  });

  revalidate();
  return { ok: true };
}

/* ---------- Mentor: approve a pending request (creates a session) ---------- */
export async function approveRequest(input: {
  slotId: string;
  title: string;
  meetingType: SessionType;
  meetingLink?: string;
  description?: string;
}): Promise<Result> {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (role !== "mentor") return { ok: false, error: "Only mentors can approve requests." };
  if (!input.title?.trim()) return { ok: false, error: "A session title is required." };

  const { data: slot } = await supabase
    .from("mentor_availability")
    .select("id, mentor_id, starts_at, ends_at, status, requested_by, session_id")
    .eq("id", input.slotId)
    .eq("mentor_id", user.id)
    .single();
  if (!slot) return { ok: false, error: "Slot not found." };
  if (!canApprove(slot)) return { ok: false, error: "Only a pending request can be approved." };
  if (!slot.requested_by) return { ok: false, error: "This slot has no pending request." };

  // Find the active mentorship so the session can be linked.
  const { data: mentorship } = await supabase
    .from("mentorships")
    .select("id")
    .eq("mentor_id", user.id)
    .eq("mentee_id", slot.requested_by)
    .eq("status", "active")
    .maybeSingle();
  if (!mentorship) {
    return { ok: false, error: "No active mentorship with this mentee." };
  }

  const start = new Date(slot.starts_at);
  const end = new Date(slot.ends_at);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

  let sessionId: string;
  try {
    const result = await createSession({
      mentorship_id: mentorship.id,
      mentor_id: user.id,
      mentee_id: slot.requested_by,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      duration_minutes: durationMinutes,
      meeting_type: input.meetingType,
      meeting_link: input.meetingLink?.trim() || undefined,
    });
    sessionId = result.session.id;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not create the session.",
    };
  }

  const { error } = await supabase
    .from("mentor_availability")
    .update({
      status: "booked",
      session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.slotId)
    .eq("mentor_id", user.id);
  if (error) return { ok: false, error: error.message };

  await notifyUser(
    slot.requested_by,
    "booking_approved",
    "Booking approved",
    `Your requested time was approved and a session "${input.title.trim()}" was scheduled.`,
    sessionId,
  );

  revalidate();
  return { ok: true };
}

/* ---------- Mentor: decline a pending request (reopens the slot) ---------- */
export async function declineRequest(slotId: string): Promise<Result> {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (role !== "mentor") return { ok: false, error: "Only mentors can decline requests." };

  const { data: slot } = await supabase
    .from("mentor_availability")
    .select("id, status, requested_by")
    .eq("id", slotId)
    .eq("mentor_id", user.id)
    .single();
  if (!slot) return { ok: false, error: "Slot not found." };
  if (!canDecline(slot)) return { ok: false, error: "Only a pending request can be declined." };

  const menteeId = slot.requested_by;

  const { error } = await supabase
    .from("mentor_availability")
    .update({
      status: "open",
      requested_by: null,
      request_note: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slotId)
    .eq("mentor_id", user.id);
  if (error) return { ok: false, error: error.message };

  if (menteeId) {
    await notifyUser(
      menteeId,
      "booking_declined",
      "Booking declined",
      "Your requested time was declined. Please choose another available slot.",
      slotId,
    );
  }

  revalidate();
  return { ok: true };
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (Do NOT run `next build` — the dev server may be live; a build clobbers its `.next`.)

- [ ] **Step 4: Re-run the unit tests (guards unchanged, confirm nothing broke)**

Run: `npx vitest run src/lib/availability.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/notifications.ts src/app/dashboard/availability/actions.ts
git commit -m "Add availability server actions (create/request/approve/decline) + notification types"
```

---

### Task 4: Mentor availability page

**Files:**
- Create: `src/app/dashboard/mentor/availability/page.tsx` (server component)
- Create: `src/app/dashboard/mentor/availability/MentorAvailabilityClient.tsx` (client component)

**Interfaces:**
- Consumes: `createSlot`, `deleteSlot`, `approveRequest`, `declineRequest` from `@/app/dashboard/availability/actions`; `SessionType` from `@/lib/models/session`; server client from `@/lib/supabase/server`.
- Produces: the route `/dashboard/mentor/availability`.

- [ ] **Step 1: Create the server page**

Create `src/app/dashboard/mentor/availability/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import MentorAvailabilityClient, {
  type MentorSlot,
} from "./MentorAvailabilityClient";

export const metadata = { title: "Availability" };

export default async function MentorAvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: slots } = await supabase
    .from("mentor_availability")
    .select(
      `id, starts_at, ends_at, status, request_note, requested_by,
       user_profiles!mentor_availability_requested_by_fkey ( full_name )`,
    )
    .eq("mentor_id", user.id)
    .order("starts_at", { ascending: true });

  const rows: MentorSlot[] = (slots ?? []).map((s) => {
    const profile = Array.isArray(s.user_profiles)
      ? s.user_profiles[0]
      : s.user_profiles;
    return {
      id: s.id,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      status: s.status,
      requestNote: s.request_note,
      requesterName: profile?.full_name ?? null,
    };
  });

  return <MentorAvailabilityClient slots={rows} />;
}
```

Note on the FK alias: `mentor_availability_requested_by_fkey` is the auto-generated constraint name for the `requested_by` foreign key created in Task 1. If PostgREST reports it cannot find that relationship, confirm the exact constraint name with:
`node scripts/apply-sql.mjs "select conname from pg_constraint where conrelid = 'public.mentor_availability'::regclass and contype = 'f';"`
and use the name for the `requested_by` column.

- [ ] **Step 2: Create the client component**

Create `src/app/dashboard/mentor/availability/MentorAvailabilityClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSlot,
  deleteSlot,
  approveRequest,
  declineRequest,
} from "@/app/dashboard/availability/actions";
import type { SessionType } from "@/lib/models/session";

export type MentorSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: "open" | "pending" | "booked";
  requestNote: string | null;
  requesterName: string | null;
};

const MEETING_TYPES: { value: SessionType; label: string }[] = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "microsoft_teams", label: "Microsoft Teams" },
  { value: "phone", label: "Phone" },
  { value: "in_person", label: "In Person" },
  { value: "other", label: "Other" },
];

function fmt(iso: string): string {
  return new Date(iso).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MentorAvailabilityClient({
  slots,
}: {
  slots: MentorSlot[];
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const pending = slots.filter((s) => s.status === "pending");
  const open = slots.filter((s) => s.status === "open");
  const booked = slots.filter((s) => s.status === "booked");

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!date || !startTime || !endTime) {
      setError("Please provide a date, start time, and end time.");
      return;
    }
    const startsAt = new Date(`${date}T${startTime}`).toISOString();
    const endsAt = new Date(`${date}T${endTime}`).toISOString();
    setBusy(true);
    const res = await createSlot({ startsAt, endsAt });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not add the slot.");
      return;
    }
    setDate("");
    setStartTime("");
    setEndTime("");
    router.refresh();
  }

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
    else router.refresh();
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h1>Availability</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        Publish open time slots. Your mentees can request one, and you approve it
        to create a session.
      </p>

      {error && (
        <div role="alert" style={{ color: "var(--error, #b00020)", margin: "0.5rem 0" }}>
          {error}
        </div>
      )}

      <form onSubmit={addSlot} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "end", margin: "1rem 0" }}>
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span>Start</span>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span>End</span>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </label>
        <button type="submit" disabled={busy}>Add slot</button>
      </form>

      <section>
        <h2>Pending requests</h2>
        {pending.length === 0 && <p>No pending requests.</p>}
        {pending.map((s) => (
          <PendingRow key={s.id} slot={s} busy={busy} onApprove={(input) => run(() => approveRequest(input))} onDecline={() => run(() => declineRequest(s.id))} />
        ))}
      </section>

      <section>
        <h2>Open slots</h2>
        {open.length === 0 && <p>No open slots.</p>}
        {open.map((s) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
            <span>{fmt(s.startsAt)} – {fmt(s.endsAt)}</span>
            <button type="button" disabled={busy} onClick={() => run(() => deleteSlot(s.id))}>Delete</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Booked</h2>
        {booked.length === 0 && <p>No booked slots yet.</p>}
        {booked.map((s) => (
          <div key={s.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
            {fmt(s.startsAt)} – {fmt(s.endsAt)}
            {s.requesterName ? ` · ${s.requesterName}` : ""}
          </div>
        ))}
      </section>
    </div>
  );
}

function PendingRow({
  slot,
  busy,
  onApprove,
  onDecline,
}: {
  slot: MentorSlot;
  busy: boolean;
  onApprove: (input: {
    slotId: string;
    title: string;
    meetingType: SessionType;
    meetingLink?: string;
  }) => void;
  onDecline: () => void;
}) {
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState<SessionType>("google_meet");
  const [meetingLink, setMeetingLink] = useState("");

  return (
    <div style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--border-color)" }}>
      <div><strong>{fmt(slot.startsAt)} – {fmt(slot.endsAt)}</strong></div>
      <div>Requested by {slot.requesterName ?? "a mentee"}</div>
      {slot.requestNote && <div style={{ fontStyle: "italic" }}>“{slot.requestNote}”</div>}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <input placeholder="Session title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select value={meetingType} onChange={(e) => setMeetingType(e.target.value as SessionType)}>
          {MEETING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input placeholder="Meeting link (optional)" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
        <button type="button" disabled={busy || !title.trim()} onClick={() => onApprove({ slotId: slot.id, title, meetingType, meetingLink: meetingLink || undefined })}>Approve</button>
        <button type="button" disabled={busy} onClick={onDecline}>Decline</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/mentor/availability/
git commit -m "Add mentor availability page (add slots, approve/decline requests)"
```

---

### Task 5: Mentee availability page

**Files:**
- Create: `src/app/dashboard/mentee/availability/page.tsx` (server component)
- Create: `src/app/dashboard/mentee/availability/MenteeAvailabilityClient.tsx` (client component)

**Interfaces:**
- Consumes: `requestSlot` from `@/app/dashboard/availability/actions`; server client from `@/lib/supabase/server`.
- Produces: the route `/dashboard/mentee/availability`.

- [ ] **Step 1: Create the server page**

Create `src/app/dashboard/mentee/availability/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import MenteeAvailabilityClient, {
  type MenteeSlot,
} from "./MenteeAvailabilityClient";

export const metadata = { title: "Availability" };

export default async function MenteeAvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Find the mentee's active mentor(s).
  const { data: mentorships } = await supabase
    .from("mentorships")
    .select("mentor_id")
    .eq("mentee_id", user.id)
    .eq("status", "active");
  const mentorIds = (mentorships ?? []).map((m) => m.mentor_id);

  let slots: MenteeSlot[] = [];
  if (mentorIds.length) {
    // RLS lets the mentee read their mentor's slots. Show open slots plus the
    // mentee's own pending/booked ones.
    const { data } = await supabase
      .from("mentor_availability")
      .select("id, starts_at, ends_at, status, requested_by")
      .in("mentor_id", mentorIds)
      .order("starts_at", { ascending: true });

    slots = (data ?? [])
      .filter(
        (s) => s.status === "open" || s.requested_by === user.id,
      )
      .map((s) => ({
        id: s.id,
        startsAt: s.starts_at,
        endsAt: s.ends_at,
        status: s.status,
        isMine: s.requested_by === user.id,
      }));
  }

  return (
    <MenteeAvailabilityClient slots={slots} hasMentor={mentorIds.length > 0} />
  );
}
```

- [ ] **Step 2: Create the client component**

Create `src/app/dashboard/mentee/availability/MenteeAvailabilityClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestSlot } from "@/app/dashboard/availability/actions";

export type MenteeSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: "open" | "pending" | "booked";
  isMine: boolean;
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MenteeAvailabilityClient({
  slots,
  hasMentor,
}: {
  slots: MenteeSlot[];
  hasMentor: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const open = slots.filter((s) => s.status === "open");
  const mine = slots.filter((s) => s.isMine && s.status !== "open");

  async function request(slotId: string) {
    setError("");
    setBusy(true);
    const res = await requestSlot(slotId, note || undefined);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Could not request this slot.");
    else {
      setNote("");
      router.refresh();
    }
  }

  if (!hasMentor) {
    return (
      <div style={{ maxWidth: 680 }}>
        <h1>Availability</h1>
        <p>You do not have an assigned mentor yet.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h1>Availability</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        Request a time that works for you. Your mentor approves it to schedule a
        session.
      </p>

      {error && (
        <div role="alert" style={{ color: "var(--error, #b00020)", margin: "0.5rem 0" }}>
          {error}
        </div>
      )}

      <section>
        <h2>Open times</h2>
        {open.length === 0 && <p>No open times right now.</p>}
        {open.length > 0 && (
          <label style={{ display: "block", margin: "0.5rem 0" }}>
            <span>Note to your mentor (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} style={{ width: "100%" }} />
          </label>
        )}
        {open.map((s) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
            <span>{fmt(s.startsAt)} – {fmt(s.endsAt)}</span>
            <button type="button" disabled={busy} onClick={() => request(s.id)}>Request</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Your requests</h2>
        {mine.length === 0 && <p>You have no pending or booked requests.</p>}
        {mine.map((s) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
            <span>{fmt(s.startsAt)} – {fmt(s.endsAt)}</span>
            <span>{s.status === "pending" ? "Awaiting approval" : "Booked"}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/mentee/availability/
git commit -m "Add mentee availability page (request open slots, track requests)"
```

---

### Task 6: Sidebar navigation links

**Files:**
- Modify: `src/components/dashboard/DashboardSidebar.tsx` (add an "Availability" item to `mentorNav` and `menteeNav`)

**Interfaces:**
- Consumes: the routes created in Tasks 4 and 5.

- [ ] **Step 1: Add the mentor link**

In `src/components/dashboard/DashboardSidebar.tsx`, in the `mentorNav` array, add an Availability item after the Sessions item:

```ts
  { href: '/dashboard/mentor/sessions', label: 'Sessions' },
  { href: '/dashboard/mentor/availability', label: 'Availability' },
  { href: '/dashboard/mentor/resources', label: 'Resources' },
```

- [ ] **Step 2: Add the mentee link**

In the `menteeNav` array, add an Availability item after the Sessions item:

```ts
  { href: '/dashboard/mentee/sessions', label: 'Sessions' },
  { href: '/dashboard/mentee/availability', label: 'Availability' },
  { href: '/dashboard/mentee/resources', label: 'Resources' },
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/DashboardSidebar.tsx
git commit -m "Add Availability links to mentor and mentee dashboard navs"
```

---

## Final verification (after all tasks)

- [ ] `npx vitest run` — all suites pass (existing + new `availability.test.ts`).
- [ ] `npx tsc --noEmit` — clean.
- [ ] Production build: only after stopping any running `next dev` (a build clobbers the dev server's `.next`). Run `npx next build` and confirm it compiles.
- [ ] Restart the dev server for manual QA.
