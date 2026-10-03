-- Storage policies so signed-in users can upload their own profile photo to
-- the public `avatars` bucket. Path convention used by the app:
--   avatars/<user_id>/avatar.jpg
--
-- Apply in the Supabase SQL editor. Safe to re-run.

-- Ensure the bucket exists and is public (read).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Public read of avatars.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

-- A user may upload only into their own folder (first path segment = their uid).
drop policy if exists "avatars_user_insert" on storage.objects;
create policy "avatars_user_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- A user may overwrite their own avatar.
drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
