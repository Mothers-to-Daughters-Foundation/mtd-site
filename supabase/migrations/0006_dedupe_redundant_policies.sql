-- Performance/cleanup: remove exact-duplicate permissive policies.
--
-- Each dropped policy is fully covered by an identical policy that targets a
-- broader role set, so access is unchanged (advisor: multiple_permissive_policies):
--   - plans: "Authenticated users can view active plans" (authenticated) is
--     covered by "Public can view active plans" (anon, authenticated).
--   - user_profiles: the authenticated-only own SELECT/UPDATE policies are
--     covered by the public (anon+authenticated) own SELECT/UPDATE policies.
--
-- Apply in Supabase (idempotent).

drop policy if exists "Authenticated users can view active plans" on public.plans;
drop policy if exists "Users can view their own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
