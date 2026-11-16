-- Richer matching profile, shared by mentees and mentors.
--
-- Both roles answer the same questions from the same option lists (see
-- src/lib/onboarding-options.ts); only the wording differs. Mentors keep using
-- career_areas for interests and career_goals for "goals I can help with".
--
--   motivations         why a mentee joined / why a mentor mentors
--   success_values      what success means to them (lightly weighted)
--   opportunity_values  what they look for in a role / what a mentor advises on
--   *_other             optional free text next to those questions
--   about_me            optional "anything else"; only used for keyword overlap
--
-- Apply in the Supabase SQL editor. Safe to re-run.

alter table public.user_profiles
  add column if not exists motivations text[],
  add column if not exists success_values text[],
  add column if not exists opportunity_values text[],
  add column if not exists career_goals_other text,
  add column if not exists success_other text,
  add column if not exists opportunity_other text,
  add column if not exists about_me text;

-- Why a match was or wasn't assigned automatically, shown to admins on review.
alter table public.match_suggestions
  add column if not exists match_score real,
  add column if not exists confidence_reasons text[];
