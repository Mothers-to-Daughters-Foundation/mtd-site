# Blog Rip — Design

**Date:** 2026-10-05
**Status:** Approved for planning
**Part of:** Content rips (3 of 3: News ✅ → Events ✅ → **Blog**).

## Goal

`/blog` mirrors the live blog — cards with image, title, excerpt, author, date,
and read time. Each post has its own page (title, author, date, read time, hero
image, Markdown body, and a Recent Posts list) with a view counter. Posts are
stored as MDX. This cycle rips the 12 most recent posts (2022–2025); the older
13 are a later follow-on reusing the same machinery.

## Architecture

Reuse the MDX pipeline (`getAllPosts`, `getPostBySlug`, `BlogFrontmatter`) and
the existing `/blog` + `/blog/[slug]` routes. Add `author` to `BlogFrontmatter`
and a pure `readingTime(content)` helper (unit-tested). Add a Supabase
`post_views` table with a service-role-only increment via an API route; the post
page reads the count and a small client component fires the increment on mount.

## Components

### 1. `BlogFrontmatter` + reading time

- `src/lib/mdx.ts`: add `author?: string;` to `BlogFrontmatter`.
- `src/lib/reading-time.ts` (pure, tested): `readingTime(content: string): number`
  — words / 200, rounded up, minimum 1. Rendered as "N min read".

### 2. View counter

- Migration `supabase/migrations/0012_post_views.sql`:
  ```sql
  create table if not exists public.post_views (
    slug text primary key,
    views integer not null default 0,
    updated_at timestamptz not null default now()
  );
  alter table public.post_views enable row level security;
  create policy "Anyone can read view counts" on public.post_views
    for select to anon, authenticated using (true);
  -- No insert/update policy: writes happen only via the service-role API route.
  ```
  Applied live via `node scripts/apply-sql.mjs`.
- `POST /api/blog/views` (`src/app/api/blog/views/route.ts`): body `{ slug: string }`
  (zod, non-empty). Uses the admin client to upsert-increment:
  select current row → insert with `views: 1` if absent, else update
  `views = current + 1`, `updated_at = now`. Returns `{ views }`. Never throws to
  the client (best-effort; returns `{ views: 0 }` on error).
- `getPostViews(slug)` helper (in the route file or `src/lib/supabase/`):
  reads the count with the anon/server client for display (RLS allows select).

### 3. Post page (`src/app/(site)/blog/[slug]/page.tsx`)

Render: title, a meta line with **author**, formatted **date**, and
**"N min read"** (`readingTime(post.content)`), hero image, Markdown body. Then:
- A **view count** ("N views"), read server-side via `getPostViews(slug)`.
- A small client component `<ViewBeacon slug={slug} />` that POSTs
  `/api/blog/views` once on mount (fire-and-forget).
- A **Recent Posts** section: the 3 most recent posts other than the current one
  (from `getAllPosts()`), each linking to its `/blog/[slug]`.

### 4. List page (`src/app/(site)/blog/page.tsx`)

Keep the existing card grid; add **author** and **"N min read"** to each card's
meta (alongside the existing date), computing read time from `post.content`.
Heading stays "Blog" / "All Posts"; no category filter (the live site has none).

### 5. Ripped posts (`content/blog/*.mdx`)

Rip the 12 posts below (newest first). Frontmatter
`{ title, slug, date, excerpt, author, image? }`; body transcribed from the live
post via WebFetch, cleaned of nav/footer/"Recent Posts" boilerplate. Capture the
real author from each post page (fallback "Mothers to Daughters"). Keep the 2
existing posts. Images are best-effort: if a clean hero image URL is obtained
from the post, download it to `public/images/blog/<slug>.<ext>` and set `image`;
otherwise omit `image` (card placeholder). Base URL: `https://www.motherstodaughters.org`.

| # | date | slug | title | body path |
|---|---|---|---|---|
| 1 | 2025-03-08 | iwd-2025-policy-gender-equality | IWD 2025 Article: How Policy and Legislation Can Accelerate Action toward Gender Equality | /post/iwd-2025-article-how-policy-and-legislation-can-accelerate-action-toward-gender-equality |
| 2 | 2025-03-08 | interview-with-my-mom-emily | An Interview with My Mom, Emily: A Life Story of Strength, Resilience, Independence | /post/an-interview-with-my-mom-emily-a-life-story-of-strength-resilience-independence |
| 3 | 2025-01-17 | holiday-reflections-2025 | Holiday Reflections and Excitement for 2025 | /post/holiday-reflections-and-excitement-for-2025 |
| 4 | 2024-11-18 | collaboration-over-competition-6ix-academy | Collaboration Over Competition: How 6ix Academy and Mothers to Daughters Joined Forces | /post/collaboration-over-competition-how-6ix-academy-and-mothers-to-daughters-joined-forces |
| 5 | 2024-07-30 | being-intentional-with-summer-events | Being Intentional with Summer Events: A Guide for Mothers and Daughters | /post/being-intentional-with-summer-events-a-guide-for-mothers-and-daughters |
| 6 | 2024-05-14 | the-power-of-mentorship | The Power of Mentorship | /post/the-power-of-mentorship |
| 7 | 2024-01-08 | the-spirit-of-christmas | The Spirit of Christmas | /post/the-spirit-of-christmas |
| 8 | 2023-11-09 | community-partnerships-catalyst-for-growth | Community Partnerships: A Catalyst for Growth | /post/community-partnerships-a-catalyst-for-growth |
| 9 | 2023-10-09 | how-ai-and-technology-affect-women | How AI and Technology Affect Women Has Changed Over Time | /post/how-ai-and-technology-affect-women-has-been-a-story-that-has-changed-over-time |
| 10 | 2023-06-09 | time-management-underrated-or-hard-to-achieve | Time Management: Underrated or Hard to Achieve? | /post/time-management-underrated-or-hard-to-achieve |
| 11 | 2023-03-06 | women-as-a-powerful-force | Women as a Powerful Force | /post/women-as-a-powerful-force |
| 12 | 2022-12-21 | thinking-of-people-deprived-of-privileges-holiday | Thinking of People Deprived of Certain Privileges During the Holiday and Ways to Support Them | /post/thinking-of-people-who-don-t-have-certain-privileges-during-the-holiday-and-how-supporting-them-can |

Known author: post 1 is **Annamaria Ananiadis**.

## Error Handling

- View increment/read failures are swallowed (counter shows 0 or last value;
  never breaks the page).
- A failed image download → omit `image` (placeholder).
- A thin/truncated WebFetch body → keep what was fetched + note for review.

## Testing

- Unit (vitest): `readingTime` — empty → 1, ~200 words → 1, ~450 words → 3.
- Build renders `/blog` + all `/blog/[slug]` routes.
- Manual: list shows author + read time; post page shows author/date/read time,
  body, "N views" (and increments on reload), and 3 recent posts; view API
  returns `{ views }`.

## Out of Scope

- The older 13 posts (later follow-on).
- Per-user view de-duplication / bot filtering (simple increment per load).
- Category filtering (live site has none).
