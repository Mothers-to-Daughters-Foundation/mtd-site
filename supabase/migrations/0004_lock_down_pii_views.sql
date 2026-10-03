-- SECURITY: lock down PII-exposing views flagged by the advisors.
--
-- `public.admin_users` joins auth.users (email) and `public.public_profile_view`
-- exposes phone/bio. Both were granted to anon/authenticated, so anyone holding
-- the public anon key could read every user's email, phone, bio, and location
-- via PostgREST. admin_users is only read server-side (lib/supabase/users.ts,
-- which now uses the service-role client); public_profile_view is unused.
--
-- Fix: revoke anon/authenticated access from both views. admin_users must stay
-- SECURITY DEFINER so the service role can read auth.users through it; access is
-- now limited to the service role, so that is safe. public_profile_view reads
-- only user_profiles, so it is switched to security_invoker.
--
-- Apply in Supabase (idempotent).

-- admin_users: keep SECURITY DEFINER (needs auth.users), remove public access.
alter view public.admin_users set (security_invoker = off);
revoke all on public.admin_users from anon, authenticated;

-- public_profile_view: unused + only reads user_profiles -> invoker + no access.
alter view public.public_profile_view set (security_invoker = on);
revoke all on public.public_profile_view from anon, authenticated;

-- Harden the two functions with a role-mutable search_path.
do $$
declare r record;
begin
  for r in
    select oid::regprocedure as sig
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname in ('get_my_profile', 'update_updated_at_column')
  loop
    execute format('alter function %s set search_path = public', r.sig);
  end loop;
end $$;
