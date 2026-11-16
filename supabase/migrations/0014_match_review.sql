-- Matching: mentor capacity and an admin review queue for low-confidence matches.
--
-- max_mentees: how many active mentees a mentor can take. NULL = no limit.
-- Auto-matching never assigns a mentor who is at capacity.
--
-- match_suggestions: one row per matching decision. High-confidence matches are
-- assigned automatically and logged as 'auto_assigned'; everything else waits as
-- 'pending' until an admin approves the top suggestion ('approved'), picks a
-- different mentor ('overridden') or dismisses it ('dismissed'). The table doubles
-- as the record for auto-resolution and override rates.
--
-- Apply in the Supabase SQL editor. Safe to re-run.

alter table public.user_profiles
  add column if not exists max_mentees integer;

alter table public.user_profiles
  drop constraint if exists user_profiles_max_mentees_positive;
alter table public.user_profiles
  add constraint user_profiles_max_mentees_positive
  check (max_mentees is null or max_mentees > 0);

create table if not exists public.match_suggestions (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.user_profiles(id) on delete cascade,
  -- Ranked snapshot: [{ mentorId, score, kind, matched, activeMenteeCount, maxMentees }]
  candidates jsonb not null default '[]'::jsonb,
  confidence text not null,
  suggested_mentor_id uuid references public.user_profiles(id) on delete set null,
  chosen_mentor_id uuid references public.user_profiles(id) on delete set null,
  mentorship_id uuid references public.mentorships(id) on delete set null,
  status text not null default 'pending',
  decided_by uuid references public.user_profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint match_suggestions_confidence check (confidence in ('high','low','none')),
  constraint match_suggestions_status
    check (status in ('auto_assigned','pending','approved','overridden','dismissed'))
);

-- At most one open review per mentee.
create unique index if not exists match_suggestions_one_pending_per_mentee
  on public.match_suggestions (mentee_id) where status = 'pending';

create index if not exists match_suggestions_mentee_id_idx on public.match_suggestions (mentee_id);
create index if not exists match_suggestions_suggested_mentor_id_idx on public.match_suggestions (suggested_mentor_id);
create index if not exists match_suggestions_chosen_mentor_id_idx on public.match_suggestions (chosen_mentor_id);
create index if not exists match_suggestions_mentorship_id_idx on public.match_suggestions (mentorship_id);
create index if not exists match_suggestions_decided_by_idx on public.match_suggestions (decided_by);
create index if not exists match_suggestions_status_idx on public.match_suggestions (status);

alter table public.match_suggestions enable row level security;

drop policy if exists "Admins manage match suggestions" on public.match_suggestions;
create policy "Admins manage match suggestions" on public.match_suggestions
  for all to authenticated
  using ((select get_user_role()) = 'admin')
  with check ((select get_user_role()) = 'admin');
