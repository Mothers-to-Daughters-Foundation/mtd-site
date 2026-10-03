-- Fix: infinite recursion (42P17) in messaging row-level security.
--
-- Cause: the SELECT policy on public.conversation_members subqueried
-- public.conversation_members, so evaluating the policy re-entered the same
-- policy forever. The messages policy then read conversation_members and hit
-- the same loop, so /dashboard/messages crashed before render.
--
-- Fix: membership on conversation_members is decided ONLY by user_id =
-- auth.uid() (no self-subquery). Policies that need "is this user a member of
-- conversation X" use a SECURITY DEFINER helper so they do not re-enter the
-- conversation_members policy.
--
-- Apply this in the Supabase SQL editor (or `supabase db push`). Safe to
-- re-run: it drops existing policies on these tables first.

-- 1. Membership check that bypasses RLS (prevents recursion) ----------------
create or replace function public.is_conversation_member(conv_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.conversation_members
    where conversation_id = conv_id
      and user_id = auth.uid()
      and is_active = true
  );
$$;

grant execute on function public.is_conversation_member(uuid) to authenticated;

-- 2. Drop any existing policies on the two tables ---------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'conversation_members'
  loop
    execute format(
      'drop policy if exists %I on public.conversation_members',
      pol.policyname
    );
  end loop;

  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
  loop
    execute format('drop policy if exists %I on public.messages', pol.policyname);
  end loop;
end $$;

-- 3. conversation_members: a user sees ONLY their own rows ------------------
--    (no subquery on conversation_members -> no recursion)
alter table public.conversation_members enable row level security;

create policy "conversation_members_select_own"
  on public.conversation_members
  for select
  using (user_id = auth.uid());

-- 4. messages: scoped to conversations the user belongs to ------------------
--    membership is checked via the SECURITY DEFINER helper, not a direct
--    subquery, so the conversation_members policy is never re-entered.
alter table public.messages enable row level security;

create policy "messages_select_member"
  on public.messages
  for select
  using (public.is_conversation_member(conversation_id));

create policy "messages_insert_member"
  on public.messages
  for insert
  with check (
    sender_id = auth.uid()
    and public.is_conversation_member(conversation_id)
  );

create policy "messages_update_member"
  on public.messages
  for update
  using (public.is_conversation_member(conversation_id))
  with check (public.is_conversation_member(conversation_id));
