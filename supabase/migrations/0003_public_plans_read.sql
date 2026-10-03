-- Allow anyone (anon + authenticated) to read ACTIVE membership plans.
--
-- The public membership page and the mentee subscription page both load plans
-- through getPublicPlans(), which uses a cookieless anon client. The only
-- existing SELECT policy on `plans` was limited to the `authenticated` role, so
-- anon reads returned zero rows and the pages showed "coming soon" / an empty
-- grid. Pricing is public information, so expose active plans to everyone.
--
-- Apply in Supabase (idempotent).

alter table public.plans enable row level security;

drop policy if exists "Public can view active plans" on public.plans;

create policy "Public can view active plans"
  on public.plans
  for select
  to anon, authenticated
  using (is_active = true);
