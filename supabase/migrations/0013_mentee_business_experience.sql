-- Mentee onboarding: years of business experience (single choice).
alter table public.user_profiles
  add column if not exists business_experience text;
