-- Admin user management: deactivate (reversible) and delete (permanent).
--
-- 1. user_profiles.deactivated_at marks a deactivated account. The admin route
--    also bans the auth user, which blocks sign-in; this column lets the app
--    lock out sessions that were already open and show the status to admins.
--
-- 2. admin_delete_user_data(target) removes everything in `public` that points
--    at the user, then the profile row. It finds the links itself (any
--    single-column foreign key), so tables added later are covered without
--    changing this function. Before a row is deleted, the rows that point at it
--    are dealt with first, all the way down (a mentor's mentorship goes, and so
--    do that mentorship's sessions). For each link:
--      * "who did it" columns (names ending in _by) and the audit-log and
--        bug-report tables keep their rows, with the reference cleared, when
--        the column allows null;
--      * otherwise the linked rows are deleted.
--    It all runs in one transaction: if anything blocks, nothing is removed
--    and the error says which table. The app deletes the auth user
--    (auth.users) right after this succeeds.
--
-- Apply in Supabase (idempotent).

alter table public.user_profiles
  add column if not exists deactivated_at timestamptz;

-- Delete the rows of `tbl` matching `cond`, after first clearing or deleting
-- the rows in other public tables that reference them.
create or replace function public.admin_purge_rows(tbl regclass, cond text, depth int default 0)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fk record;
  child_cond text;
begin
  if depth > 8 then
    raise exception 'Linked data on % is nested too deeply to remove automatically', tbl;
  end if;

  for fk in
    select
      c.conrelid::regclass as child,
      a.attname as col,
      a.attnotnull as not_null,
      ra.attname as ref_col
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    join pg_attribute ra on ra.attrelid = c.confrelid and ra.attnum = c.confkey[1]
    where c.contype = 'f'
      and array_length(c.conkey, 1) = 1
      and c.confrelid = tbl
      and c.conrelid <> tbl
      and c.connamespace = 'public'::regnamespace
  loop
    child_cond := format('%I in (select %I from %s where %s)', fk.col, fk.ref_col, tbl, cond);
    if not fk.not_null
       and (fk.col like '%\_by' or fk.child::text in ('audit_logs', 'bug_reports')) then
      execute format('update %s set %I = null where %s', fk.child, fk.col, child_cond);
    else
      perform public.admin_purge_rows(fk.child, child_cond, depth + 1);
    end if;
  end loop;

  execute format('delete from %s where %s', tbl, cond);
end;
$$;

create or replace function public.admin_delete_user_data(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fk record;
  cond text;
begin
  -- Public tables that point straight at auth.users get the same treatment.
  -- (auth.users itself is deleted by the app once this returns.)
  for fk in
    select
      c.conrelid::regclass as child,
      a.attname as col,
      a.attnotnull as not_null
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f'
      and array_length(c.conkey, 1) = 1
      and c.confrelid = 'auth.users'::regclass
      and c.conrelid <> 'public.user_profiles'::regclass
      and c.connamespace = 'public'::regnamespace
  loop
    cond := format('%I = %L', fk.col, target);
    if not fk.not_null
       and (fk.col like '%\_by' or fk.child::text in ('audit_logs', 'bug_reports')) then
      execute format('update %s set %I = null where %s', fk.child, fk.col, cond);
    else
      perform public.admin_purge_rows(fk.child, cond, 1);
    end if;
  end loop;

  -- Then the profile and everything that hangs off it.
  perform public.admin_purge_rows('public.user_profiles'::regclass, format('id = %L', target));
end;
$$;

revoke all on function public.admin_purge_rows(regclass, text, int) from public, anon, authenticated;
revoke all on function public.admin_delete_user_data(uuid) from public, anon, authenticated;
grant execute on function public.admin_delete_user_data(uuid) to service_role;
