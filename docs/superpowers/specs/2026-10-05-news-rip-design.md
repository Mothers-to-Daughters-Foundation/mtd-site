# News Rip — Design

**Date:** 2026-10-05
**Status:** Approved for planning
**Part of:** Content rips (1 of 3: News → Events → Blog). Events and Blog are separate specs.

## Goal

Make `/news` faithfully mirror the live motherstodaughters.org newsroom: the
intro copy, a hero image, and the real article list — with each article ripped
into MDX including its full body, rendered at `/news/[slug]`.

## Architecture

Reuse the existing MDX content pipeline (`src/lib/mdx.ts`: `getAllNews`,
`getNewsBySlug`, `NewsFrontmatter`) and the existing routes
(`src/app/(site)/news/page.tsx` list, `src/app/(site)/news/[slug]/page.tsx`
detail). This cycle (a) adds the verbatim intro + hero section to the list page
and (b) replaces the single placeholder news item with the 13 real articles
ripped from the live site, each with full body content. Images are downloaded
into `public/images/news/` (do not hotlink Wix).

## Content source

Fetch the live pages with WebFetch and transcribe the real copy into MDX. Each
article's full body is fetched from its live detail URL (listed below). The user
reviews the ripped content after it is committed / in the running site.

## Components

### 1. News list page — intro + hero (`src/app/(site)/news/page.tsx`)

Add a header/intro block above the article grid, with this verbatim copy:

- Title: **News**
- Subhead: **Stay Inspired. Stay Informed.** followed by: "Welcome to the M2D
  Newsroom—your go-to space for updates, insights, and stories shaping the
  future of women in business, leadership, and social impact."
- **What You'll Find Here:**
  - **Program Highlights** – Success stories and major milestones from our mentorship cohorts
  - **Community Impact** – How M2D is empowering women globally through innovation and entrepreneurship
  - **Voices of Wisdom** – Thought leadership from our mentors, mentees, and partners
  - **Announcements & Events** – Exclusive updates on upcoming programs, networking opportunities, and collaborations
- Closing: "We're not just telling stories—we're documenting a movement. Stay
  connected, celebrate our wins, and be part of the journey."
- Hero image: the MintRoomsShoot photo, downloaded to
  `public/images/news/hero.jpg`.

The article grid stays as-is (newest-first via `getAllNews`): each card shows
image, date, title, excerpt, and a Read More link to `/news/[slug]`.

### 2. Ripped articles (`content/news/*.mdx`)

Replace the lone existing placeholder with the 13 real articles below. Each MDX
has frontmatter `{ title, slug, date, excerpt, image }` and a full body
transcribed from the article's live detail page. Dates use ISO (`YYYY-MM-DD`).
Slugs are clean/readable (not the Wix URL-encoded form).

| # | Date | Title | Slug | Live body URL |
|---|---|---|---|---|
| 1 | 2025-06-04 | PACE Toronto 2025 – A Youth-Led Celebration of Culture & Creativity | pace-toronto-2025 | /news/pace-toronto-2025%3A-a-youth-led-celebration-of-culture-%26-creativity |
| 2 | 2025-05-12 | Mothers to Daughters U.S. Launch | mothers-to-daughters-us-launch | /news/mothers-to-daughters-u.s-launch |
| 3 | 2025-05-12 | How Francine Mbvoumbo Is Empowering Women Entrepreneurs | how-francine-mbvoumbo-is-empowering-women-entrepreneurs | /news/how-francine-mbvoumbo-is-empowering-women-entrepreneurs |
| 4 | 2025-03-10 | 69th Session of the UN Commission on the Status of Women | 69th-session-un-commission-status-of-women | /news/69th-session-of-the-un-commission-on-the-status-of-women |
| 5 | 2025-03-10 | Mothers to Daughters Launches U.S. Expansion | mothers-to-daughters-launches-us-expansion | /news/mothers-to-daughters-launches-u.s.-expansion |
| 6 | 2025-03-10 | M2D Launches U.S. Expansion with High-Impact Initiatives to Empower Women Entrepreneurs | m2d-us-expansion-high-impact-initiatives | /news/mothers-to-daughters-launches-u.s.-expansion-with-high-impact-initiatives-to-empower-women-entrepreneurs |
| 7 | 2025-03-08 | Francine Mbvoumbo Appointed Delegate for the Commission on the Status of Women by SAEF | francine-mbvoumbo-csw-delegate-saef | /news/francine-mbvoumbo-appointment-as-delegate-for-the-commission-on-the-status-of-women-by-saef-(southern-africa-embrace-foundation) |
| 8 | 2025-03-03 | M2D Takes Center Stage at Dundas Square and Exhibition Place in Toronto for 11 Days | m2d-dundas-square-exhibition-place | /news/photoshoot |
| 9 | 2024-11-01 | The Dunamis Palace Honors Francine Mbvoumbo with the 2024 Community in Action Award | dunamis-palace-community-in-action-award | /news/the-dunamis-palace |
| 10 | 2024-10-08 | M2D Joins International Cooperation Futures | m2d-international-cooperation-futures | /news/m2d-joins-international-cooperation-futures |
| 11 | 2024-09-21 | M2D Joins the United Nations Summit of the Future | m2d-un-summit-of-the-future | /news/m2d-joins-the-united-nations-summit-of-the-future |
| 12 | 2023-09-19 | M2D Featured in Bridging the Generation Gap | m2d-bridging-the-generation-gap | /news/m2d-featured-in-bridging-the-generation-gap |
| 13 | 2023-07-20 | Francine Mbvoumbo Featured on Breaking Brave with Marilyn Barefoot | francine-mbvoumbo-breaking-brave | /news/-francine-mbvoumbo-featured-on-breaking-brave-with-marilyn-barefoot |

Base URL for bodies: `https://www.motherstodaughters.org`.

Excerpts come from the newsroom list (the one-line summaries already captured);
if a fetched body yields a cleaner one-sentence summary, use that.

### 3. Images (`public/images/news/`)

Download each article's real thumbnail where the live site has one. Articles
whose live thumbnail is a Wix `Image-empty-state` placeholder get NO `image`
frontmatter and fall back to the list card's existing placeholder. The hero
image is always downloaded.

### 4. Detail page (`src/app/(site)/news/[slug]/page.tsx`)

Already renders the title, date, hero image, and Markdown body — no structural
change required. Verify it displays the ripped body correctly.

## Error Handling

- A missing/failed image download → omit the `image` frontmatter (card uses the
  placeholder); never leave a broken `<img>`.
- If a live body page cannot be fetched, the article still gets an MDX with its
  frontmatter + excerpt as the body, and the rip continues (note it for review).

## Testing

- Production build renders `/news` and all 13 `/news/[slug]` routes
  (`generateStaticParams` already enumerates them).
- `getAllNews()` returns 13 items, newest-first.
- Manual: the intro copy and hero render; cards link correctly; no broken images.
- No unit tests (this is content + layout; verified by build + review).

## Out of Scope

- Events and Blog rips (separate specs/cycles).
- Any change to the MDX pipeline interfaces or shared components beyond the
  `/news` list page intro section.
