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
drop policy if exists "Admins manage availability" on public.mentor_availability;
create policy "Admins manage availability" on public.mentor_availability
  for all to authenticated
  using ((select get_user_role()) = 'admin')
  with check ((select get_user_role()) = 'admin');

-- Mentors fully manage their own slots.
drop policy if exists "Mentors manage own availability" on public.mentor_availability;
create policy "Mentors manage own availability" on public.mentor_availability
  for all to authenticated
  using (mentor_id = (select auth.uid()))
  with check (mentor_id = (select auth.uid()));

-- Mentees may read slots of a mentor they have an active mentorship with.
drop policy if exists "Mentees view their mentor availability" on public.mentor_availability;
create policy "Mentees view their mentor availability" on public.mentor_availability
  for select to authenticated
  using (exists (
    select 1 from public.mentorships m
    where m.mentor_id = mentor_availability.mentor_id
      and m.mentee_id = (select auth.uid())
      and m.status = 'active'::mentorship_status
  ));
