-- Matching: mentor capacity, an admin review queue for low-confidence matches,
-- and usage tracking for the optional AI step.
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
-- When the rule-based score is not confident, an AI model may rank the eligible
-- mentors. Its pick is assigned ('ai_assigned') only above a confidence threshold;
-- otherwise the case is queued for review. ai_status records whether the AI ran
-- or why it was skipped (no key, monthly budget used up, API unavailable, ...).
--
-- ai_usage: monthly AI token and dollar totals, used to enforce the budget.
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
  ai_status text not null default 'not_needed',
  ai_model text,
  ai_confidence real,
  ai_reason text,
  decided_by uuid references public.user_profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint match_suggestions_confidence check (confidence in ('high','low','none')),
  constraint match_suggestions_status
    check (status in ('auto_assigned','ai_assigned','pending','approved','overridden','dismissed'))
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

create table if not exists public.ai_usage (
  period text primary key,            -- 'YYYY-MM' (UTC)
  calls integer not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  cost_usd numeric(12,6) not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

drop policy if exists "Admins read ai usage" on public.ai_usage;
create policy "Admins read ai usage" on public.ai_usage
  for select to authenticated
  using ((select get_user_role()) = 'admin');

-- Atomic increment so concurrent matches don't lose spend.
create or replace function public.record_ai_usage(
  p_period text, p_input bigint, p_output bigint, p_cost numeric
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.ai_usage (period, calls, input_tokens, output_tokens, cost_usd, updated_at)
  values (p_period, 1, p_input, p_output, p_cost, now())
  on conflict (period) do update set
    calls = ai_usage.calls + 1,
    input_tokens = ai_usage.input_tokens + excluded.input_tokens,
    output_tokens = ai_usage.output_tokens + excluded.output_tokens,
    cost_usd = ai_usage.cost_usd + excluded.cost_usd,
    updated_at = now();
$$;

revoke all on function public.record_ai_usage(text, bigint, bigint, numeric) from public, anon, authenticated;
grant execute on function public.record_ai_usage(text, bigint, bigint, numeric) to service_role;
