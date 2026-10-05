-- Per-post view counts. Writes only via the service-role API route;
-- anon/authenticated may read counts for display.
create table if not exists public.post_views (
  slug text primary key,
  views integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.post_views enable row level security;
create policy "Anyone can read view counts" on public.post_views
  for select to anon, authenticated using (true);
