-- Mentee onboarding: interests, career goals, and a completion flag.
alter table public.user_profiles
  add column if not exists interests text[],
  add column if not exists career_goals text[],
  add column if not exists onboarding_completed boolean not null default false;
