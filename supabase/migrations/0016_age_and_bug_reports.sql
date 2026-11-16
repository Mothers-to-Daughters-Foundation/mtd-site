-- Age check and bug reports.
--
-- Age: onboarding asks for a date of birth and the server checks the minimum
-- age (NEXT_PUBLIC_MIN_MEMBER_AGE, default 18). Only the birth year and the time
-- of the check are stored, not the full date.
--
-- bug_reports: written by the API with the service role (anyone, signed in or
-- not, can report); only admins can read or update them.
--
-- Apply in the Supabase SQL editor. Safe to re-run.

alter table public.user_profiles
  add column if not exists birth_year smallint,
  add column if not exists age_confirmed_at timestamptz;

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete set null,
  contact_email text,
  description text not null,
  page_url text,
  user_agent text,
  viewport text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bug_reports_status check (status in ('new', 'in_progress', 'resolved', 'wont_fix'))
);

create index if not exists bug_reports_user_id_idx on public.bug_reports (user_id);
create index if not exists bug_reports_status_idx on public.bug_reports (status);

alter table public.bug_reports enable row level security;

drop policy if exists "Admins manage bug reports" on public.bug_reports;
create policy "Admins manage bug reports" on public.bug_reports
  for all to authenticated
  using ((select get_user_role()) = 'admin')
  with check ((select get_user_role()) = 'admin');
