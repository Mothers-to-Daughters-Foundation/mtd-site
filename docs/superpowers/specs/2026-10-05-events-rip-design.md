# Events Rip — Design

**Date:** 2026-10-05
**Status:** Approved for planning
**Part of:** Content rips (2 of 3: News ✅ → **Events** → Blog).

## Goal

Make `/events` mirror the live event list: the "Step into a space…" hero, the
real events split Upcoming/Past with date-time, location, RSVP state, image, a
More-info link and an external Details link, and a Load More control. Each event
is ripped into MDX with a full body at `/events/[slug]`.

## Architecture

Reuse the MDX pipeline (`getAllEvents`, `getEventBySlug`, `EventFrontmatter`) and
the existing `/events` routes. Extend `EventFrontmatter` with an additive
optional `rsvpState`. The event grid becomes a small client component so it can
offer Load More; the hero and the existing "Mentors Mixer" callout stay in the
server page. Images are downloaded into `public/images/events/`.

## Components

### 1. `EventFrontmatter` (additive) — `src/lib/mdx.ts`

Add one optional field (does not disturb News/Blog):
```ts
rsvpState?: 'open' | 'closed';
```

### 2. Hero/intro on the list page (`src/app/(site)/events/page.tsx`)

Add above the sections, verbatim:
- Heading: **"Step into a space where wisdom, connection, and transformation come to life"**
- Paragraph: "Join us for inspiring events where women across generations come
  together to share stories, gain powerful insights, and build lasting
  relationships. Whether you're seeking mentorship, fresh perspectives, or a
  community that uplifts and empowers—you belong here. Seats are limited—register
  now and be part of the movement!"
- Hero image downloaded to `public/images/events/hero.jpg`.

### 3. Ripped events (`content/events/*.mdx`)

Rip the 5 live events (joining the 2 existing Mentors Mixer events). Each MDX:

```
---
title: "<title>"
slug: <slug>
date: <ISO date-time, no TZ suffix, e.g. 2026-05-14T18:00:00>
endDate: <ISO end date-time>
location: "<location>"
rsvpUrl: "<Luma or event-details URL>"
rsvpState: closed
image: /images/events/<slug>.<ext>
excerpt: "<one-line summary>"
---

<full body transcribed from the event's detail page>
```

Manifest (title · slug · start · end · location · details URL · image source):

1. **Ball of Wisdom – A Leadership & Legacy Gathering by M2D** · `ball-of-wisdom-2026` · 2026-05-14T18:00:00 · 2026-05-14T21:00:00 · "Renaissance New York Chelsea Hotel, 112 W 25th St, New York, NY 10001" · https://luma.com/ga27baq8 · https://static.wixstatic.com/media/97c220_262fa25891c646d2bc71efb9a0e75b2b~mv2.jpg
2. **Money Conversations: Mentorship & the Future of Wealth** · `money-conversations-future-of-wealth` · 2026-03-31T17:30:00 · 2026-03-31T20:00:00 · "One World Trade Center, New York, NY" · https://luma.com/30902sn0 · https://static.wixstatic.com/media/97c220_4e4695d9840244c19401e89cdbef5f97~mv2.png
3. **Careers Are Assets: Negotiating Pivotal Moments with Strategy & Confidence** · `careers-are-assets` · 2026-03-19T19:00:00 · 2026-03-19T21:00:00 · "Webinar" · https://www.motherstodaughters.org/event-details/careers-are-assets-negotiating-pivotal-moments-with-strategy-confidence · https://static.wixstatic.com/media/97c220_424ebd5cdefb43e5b566fc6c6fae2cbd~mv2.png
4. **The Mothers to Daughters (M2D) Legacy Walk** · `m2d-legacy-walk` · 2026-02-10T18:00:00 · 2026-02-10T21:00:00 · "256 W 37th St, New York, NY 10018" · https://www.motherstodaughters.org/event-details/the-mothers-to-daughters-m2d-legacy-walk · https://static.wixstatic.com/media/88628d_8ca895bf89084349acb6ddc474d85564~mv2.png
5. **Date With Daughters Launch (Women Only)** · `date-with-daughters-launch` · 2026-01-21T19:00:00 · 2026-01-21T21:00:00 · "TBD" · https://www.motherstodaughters.org/event-details/date-with-daughters-launch-women-only · https://static.wixstatic.com/media/88628d_22fbb0d5fd624f778a79c807910ae78f~mv2.jpg

Bodies: fetch each Details URL via WebFetch and transcribe. The 3
`motherstodaughters.org/event-details/...` pages rip cleanly; the 2 `luma.com`
pages are off-site/dynamic — transcribe what is available, and if a Luma fetch
yields little, fall back to a one-paragraph body from the title/location and note
it. Images are downloaded from the Wix base media URL (no transform suffix).

### 4. Event grid client component + card (`src/app/(site)/events/EventList.tsx`)

Extract the Upcoming and Past grids into a client component that:
- Shows the first **6** events per section, with a **Load More** button revealing
  the rest (hidden when ≤6).
- Each card shows: image (or placeholder), title, **date + time range**
  (formatted from `date`/`endDate`), location, an **RSVP state** —
  `rsvpState === 'closed'` → a "RSVP Closed" badge; otherwise an "RSVP" button to
  `rsvpUrl` — a **More info** link to `/events/[slug]`, and a **Details** link out
  to `rsvpUrl` (`target="_blank"`).

Upcoming vs Past split stays date-based (`date >= now`), as today.

### 5. Detail page (`src/app/(site)/events/[slug]/page.tsx`)

Ensure it renders: title, date + time range, location, RSVP state / Details link,
image, and the Markdown body. Enhance only as needed to show date-time + location
+ RSVP + Details alongside the body.

## Error Handling

- Failed image download → omit `image` (card placeholder); never a broken `<img>`.
- A Luma body that can't be fetched → one-paragraph fallback body, noted for review.
- Date formatting guards against missing `endDate` (show start only).

## Testing

- Production build renders `/events` and all `/events/[slug]` routes.
- `getAllEvents()` returns the full set (5 ripped + 2 existing = 7).
- Manual: hero + intro render; Upcoming/Past split correct; date-time, location,
  RSVP state, More info + Details all show; Load More reveals additional cards.
- No unit tests (content + layout; verified by build + review).

## Out of Scope

- Blog rip (separate cycle).
- Real RSVP/registration handling — Details links point to the external Luma /
  event-details pages (registration lives off-site).
- Removing or restyling the existing "Mentors Mixer" callout.
