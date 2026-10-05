-- Structured career areas for mentors (shared vocabulary with mentee interests).
alter table public.user_profiles
  add column if not exists career_areas text[];
