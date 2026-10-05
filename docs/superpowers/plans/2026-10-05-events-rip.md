# Events Content Rip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/events` mirror the live event list — hero/intro, real events split Upcoming/Past with date-time, location, RSVP state, More-info + Details links, and Load More — with each event ripped into MDX with a full body.

**Architecture:** Reuse the MDX pipeline (`getAllEvents`, `EventFrontmatter`) and `/events` routes. Add an additive `rsvpState` to `EventFrontmatter` and a pure `formatEventWhen` date-time helper (unit-tested). The event grid becomes a client component with Load More; the hero + existing "Mentors Mixer" callout stay in the server page. Images download to `public/images/events/`.

**Tech Stack:** Next.js 14 App Router, TypeScript, `gray-matter` MDX, `next/image`, vitest, WebFetch (content), curl (images).

## Global Constraints

- Hero copy is VERBATIM (heading "Step into a space where wisdom, connection, and transformation come to life" + the "Join us for inspiring events…register now and be part of the movement!" paragraph).
- JSX text escapes apostrophes/ampersands/dashes as HTML entities (`&rsquo;`, `&amp;`, `&ndash;`, `&mdash;`) — a clean `tsc` does NOT catch this; `next build` fails on `react/no-unescaped-entities`.
- 5 ripped events with the slugs/dates in the manifest (ISO date-time, no TZ suffix, matching the existing `mentors-mixer-4-0` pattern `2024-05-30T18:00:00`). All 5 are `rsvpState: closed`.
- Images downloaded to `public/images/events/`, never hotlinked from Wix; download from the base Wix media URL (no transform suffix). A failed download → omit `image` (card placeholder).
- Upcoming vs Past split is date-based (`date >= now`). Each section shows 6 cards then a Load More.
- Do not change `getAllEvents`/`getEventBySlug` behavior; `EventFrontmatter.rsvpState` is additive/optional. Do not touch Blog/News content or shared components beyond what each task names.
- Use `tsc --noEmit` for type checks; run `next build` only after stopping any live dev server.

---

### Task 1: Add `rsvpState` + pure `formatEventWhen` helper (TDD)

**Files:**
- Modify: `src/lib/mdx.ts` (add `rsvpState?` to `EventFrontmatter`)
- Create: `src/lib/event-format.ts`
- Test: `src/lib/event-format.test.ts`

**Interfaces:**
- Produces: `formatEventWhen(date: string, endDate?: string): string` — a human date + time range, e.g. `"May 14, 2026 · 6:00 PM – 9:00 PM"` (same-day range), `"January 21, 2026 · 7:00 PM"` (no endDate), `""` (unparseable date). And `EventFrontmatter.rsvpState?: 'open' | 'closed'`.

- [ ] **Step 1: Add the optional field**

In `src/lib/mdx.ts`, in `interface EventFrontmatter`, add after `rsvpUrl?: string;`:

```ts
  rsvpState?: 'open' | 'closed';
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/event-format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatEventWhen } from './event-format';

describe('formatEventWhen', () => {
  it('formats a same-day start/end time range', () => {
    expect(formatEventWhen('2026-05-14T18:00:00', '2026-05-14T21:00:00')).toBe(
      'May 14, 2026 · 6:00 PM – 9:00 PM'
    );
  });

  it('formats start only when no endDate', () => {
    expect(formatEventWhen('2026-01-21T19:00:00')).toBe(
      'January 21, 2026 · 7:00 PM'
    );
  });

  it('formats a half-hour start time', () => {
    expect(formatEventWhen('2026-03-31T17:30:00', '2026-03-31T20:00:00')).toBe(
      'March 31, 2026 · 5:30 PM – 8:00 PM'
    );
  });

  it('returns empty string for an unparseable date', () => {
    expect(formatEventWhen('not-a-date')).toBe('');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/lib/event-format.test.ts`
Expected: FAIL — cannot resolve `./event-format`.

- [ ] **Step 4: Implement**

Create `src/lib/event-format.ts`:

```ts
const DATE_OPTS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};
const TIME_OPTS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

/**
 * Human-readable event date + time. Dates are stored without a timezone
 * suffix (local), so parsing and formatting both use local time and are
 * self-consistent. Returns '' for an unparseable start date.
 */
export function formatEventWhen(date: string, endDate?: string): string {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return '';

  const dateStr = start.toLocaleDateString('en-US', DATE_OPTS);
  const startTime = start.toLocaleTimeString('en-US', TIME_OPTS);

  if (endDate) {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      const endTime = end.toLocaleTimeString('en-US', TIME_OPTS);
      if (start.toDateString() === end.toDateString()) {
        return `${dateStr} · ${startTime} – ${endTime}`;
      }
      const endDateStr = end.toLocaleDateString('en-US', DATE_OPTS);
      return `${dateStr} ${startTime} – ${endDateStr} ${endTime}`;
    }
  }
  return `${dateStr} · ${startTime}`;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/event-format.test.ts`
Expected: PASS (4 tests). If a time assertion fails due to the runner's ICU/locale, do NOT weaken the implementation — report it; the controller will confirm the environment.

- [ ] **Step 6: Commit**

```bash
git add src/lib/mdx.ts src/lib/event-format.ts src/lib/event-format.test.ts
git commit -m "Add EventFrontmatter.rsvpState + pure formatEventWhen helper with tests"
```

---

### Task 2: Events page hero + client EventList with Load More

**Files:**
- Create: `public/images/events/hero.jpg` (downloaded)
- Create: `src/app/(site)/events/EventList.tsx`
- Create: `src/app/(site)/events/EventList.module.css`
- Modify: `src/app/(site)/events/page.tsx`
- Modify: `src/app/(site)/events/page.module.css` (add hero styles)

**Interfaces:**
- Consumes: `formatEventWhen` (Task 1); `getAllEvents`, `getImagePath`.
- Produces: client component `EventList` with exported type `EventCardData = { slug: string; title: string; date: string; endDate?: string; location?: string; rsvpUrl?: string; rsvpState?: 'open' | 'closed'; image?: string; excerpt?: string }`, default-exported component taking `{ upcoming: EventCardData[]; past: EventCardData[] }`.

- [ ] **Step 1: Download the hero image**

```bash
mkdir -p public/images/events
curl -L -o public/images/events/hero.jpg "https://static.wixstatic.com/media/9f6ef5_4bcdb3d645f74b50a851a2b26b2968a3~mv2.jpg"
```
Confirm non-zero: `ls -l public/images/events/hero.jpg`.

- [ ] **Step 2: Create the EventList client component**

Create `src/app/(site)/events/EventList.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImagePath } from '@/lib/utils';
import { formatEventWhen } from '@/lib/event-format';
import styles from './EventList.module.css';

export type EventCardData = {
  slug: string;
  title: string;
  date: string;
  endDate?: string;
  location?: string;
  rsvpUrl?: string;
  rsvpState?: 'open' | 'closed';
  image?: string;
  excerpt?: string;
};

const PAGE_SIZE = 6;

function EventCard({ event }: { event: EventCardData }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardImage}>
        {event.image ? (
          <Image
            src={getImagePath(event.image)}
            alt={event.title}
            width={400}
            height={225}
            className={styles.cardImageContent}
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <span>Mothers to Daughters</span>
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </h3>
        <p className={styles.cardWhen}>{formatEventWhen(event.date, event.endDate)}</p>
        {event.location && (
          <p className={styles.cardLocation}>📍 {event.location}</p>
        )}
        {event.excerpt && <p className={styles.cardExcerpt}>{event.excerpt}</p>}
        <div className={styles.cardActions}>
          {event.rsvpState === 'closed' ? (
            <span className={styles.rsvpClosed}>RSVP Closed</span>
          ) : (
            event.rsvpUrl && (
              <a
                className={styles.rsvpBtn}
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                RSVP
              </a>
            )
          )}
          <Link className={styles.moreInfo} href={`/events/${event.slug}`}>
            More info
          </Link>
          {event.rsvpUrl && (
            <a
              className={styles.detailsLink}
              href={event.rsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Details ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Section({ title, events }: { title: string; events: EventCardData[] }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  if (events.length === 0) return null;
  const visible = events.slice(0, shown);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.grid}>
        {visible.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
      </div>
      {shown < events.length && (
        <div className={styles.loadMoreWrap}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={() => setShown((n) => n + PAGE_SIZE)}
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}

export default function EventList({
  upcoming,
  past,
}: {
  upcoming: EventCardData[];
  past: EventCardData[];
}) {
  return (
    <>
      <Section title="Upcoming Events" events={upcoming} />
      <Section title="Past Events" events={past} />
    </>
  );
}
```

- [ ] **Step 3: Create the EventList CSS**

Create `src/app/(site)/events/EventList.module.css`:

```css
.section { margin-bottom: var(--spacing-12); }
.sectionTitle { font-size: var(--text-3xl); color: var(--text-primary); margin-bottom: var(--spacing-6); }

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-6);
}

.card {
  display: flex;
  flex-direction: column;
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.cardImage { width: 100%; aspect-ratio: 16 / 9; overflow: hidden; }
.cardImageContent { width: 100%; height: 100%; object-fit: cover; display: block; }
.cardImagePlaceholder {
  width: 100%; height: 100%;
  background-color: var(--accent-100);
  display: flex; align-items: center; justify-content: center;
  color: var(--brand-700); font-weight: var(--font-medium);
}

.cardBody { padding: var(--spacing-6); display: flex; flex-direction: column; gap: var(--spacing-2); flex: 1; }
.cardTitle { font-size: var(--text-xl); color: var(--text-primary); margin: 0; line-height: 1.25; }
.cardWhen { color: var(--brand-700); font-weight: var(--font-medium); margin: 0; }
.cardLocation, .cardExcerpt { color: var(--text-secondary); margin: 0; line-height: var(--leading-relaxed); }

.cardActions { display: flex; flex-wrap: wrap; gap: var(--spacing-3); align-items: center; margin-top: auto; padding-top: var(--spacing-3); }
.rsvpBtn {
  background: var(--brand-700); color: #fff; padding: 0.4rem 0.9rem;
  border-radius: var(--radius-md); font-weight: var(--font-medium); text-decoration: none;
}
.rsvpClosed { color: var(--text-secondary); font-weight: var(--font-medium); }
.moreInfo, .detailsLink { color: var(--brand-700); text-decoration: none; font-weight: var(--font-medium); }

.loadMoreWrap { display: flex; justify-content: center; margin-top: var(--spacing-6); }
.loadMore {
  background: transparent; border: 1px solid var(--brand-700); color: var(--brand-700);
  padding: 0.6rem 1.4rem; border-radius: 9999px; cursor: pointer; font-weight: var(--font-medium);
}
.loadMore:hover { background: var(--brand-700); color: #fff; }

@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
```

- [ ] **Step 4: Add hero styles to the page CSS**

Append to `src/app/(site)/events/page.module.css`:

```css
.hero {
  text-align: center;
  max-width: 820px;
  margin: 0 auto var(--spacing-10);
}

.heroImage {
  width: 100%;
  max-height: 360px;
  aspect-ratio: 21 / 9;
  overflow: hidden;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-8);
}

.heroImageContent { width: 100%; height: 100%; object-fit: cover; display: block; }

.heroTitle { font-size: var(--text-4xl); color: var(--text-primary); margin-bottom: var(--spacing-4); }
.heroText { font-size: var(--text-lg); color: var(--text-secondary); line-height: var(--leading-relaxed); }
```

- [ ] **Step 5: Rewrite the page to use the hero + EventList**

Replace the contents of `src/app/(site)/events/page.tsx` with:

```tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getAllEvents } from '@/lib/mdx';
import { getImagePath } from '@/lib/utils';
import EventList, { type EventCardData } from './EventList';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming and past events from Mothers to Daughters.',
};

function toCard(e: ReturnType<typeof getAllEvents>[number]): EventCardData {
  return {
    slug: e.slug,
    title: e.frontmatter.title,
    date: e.frontmatter.date,
    endDate: e.frontmatter.endDate,
    location: e.frontmatter.location,
    rsvpUrl: e.frontmatter.rsvpUrl,
    rsvpState: e.frontmatter.rsvpState,
    image: e.frontmatter.image,
    excerpt: e.frontmatter.excerpt,
  };
}

export default function EventsPage() {
  const events = getAllEvents();
  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(e.frontmatter.date) >= now)
    .map(toCard);
  const past = events
    .filter((e) => new Date(e.frontmatter.date) < now)
    .map(toCard);

  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.hero}>
          <div className={styles.heroImage}>
            <Image
              src={getImagePath('/images/events/hero.jpg')}
              alt="Mothers to Daughters events"
              width={1200}
              height={514}
              className={styles.heroImageContent}
              priority
            />
          </div>
          <h1 className={styles.heroTitle}>
            Step into a space where wisdom, connection, and transformation come
            to life
          </h1>
          <p className={styles.heroText}>
            Join us for inspiring events where women across generations come
            together to share stories, gain powerful insights, and build lasting
            relationships. Whether you&rsquo;re seeking mentorship, fresh
            perspectives, or a community that uplifts and empowers&mdash;you
            belong here. Seats are limited&mdash;register now and be part of the
            movement!
          </p>
        </div>

        {upcoming.length === 0 && past.length === 0 ? (
          <p className={styles.noEvents}>No events scheduled. Check back soon!</p>
        ) : (
          <EventList upcoming={upcoming} past={past} />
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Mentors Mixer</h2>
          <Card variant="static" className={styles.mentorsMixerCard}>
            <h3>Mentors Mixer</h3>
            <p>
              Connect with fellow mentors and mentees at our signature networking
              events.
            </p>
            <Button href="/mentors-mixer" variant="primary" size="md">
              Learn More
            </Button>
          </Card>
        </section>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add public/images/events/hero.jpg "src/app/(site)/events/EventList.tsx" "src/app/(site)/events/EventList.module.css" "src/app/(site)/events/page.tsx" "src/app/(site)/events/page.module.css"
git commit -m "Add events hero + client EventList with Load More and richer cards"
```

---

### Task 3: Rip the 5 live events (metadata + images + full bodies)

**Files:**
- Create: `content/events/ball-of-wisdom-2026.mdx`, `content/events/money-conversations-future-of-wealth.mdx`, `content/events/careers-are-assets.mdx`, `content/events/m2d-legacy-walk.mdx`, `content/events/date-with-daughters-launch.mdx`
- Create: downloaded images under `public/images/events/`

**Interfaces:**
- Produces: 5 event MDX files readable by `getAllEvents()`.

For EACH event: (a) download its image with curl from the base Wix media URL to `public/images/events/<slug>.<ext>`; (b) WebFetch the Details URL with the prompt *"Extract this event's full description/body as clean markdown (paragraphs, agenda, speakers, what to expect). EXCLUDE site nav, header, footer, ticket widgets, cookie banners, and boilerplate. Return only the event's own descriptive content."*; (c) write the MDX. If a `luma.com` fetch yields little usable text, write a one-paragraph body from the title + location and note it in the report.

Frontmatter template (YAML — plain apostrophes, double-quoted strings):

```
---
title: "<title>"
slug: <slug>
date: <start ISO, no TZ>
endDate: <end ISO, no TZ>
location: "<location>"
rsvpUrl: "<details URL>"
rsvpState: closed
image: /images/events/<slug>.<ext>
excerpt: "<one-line summary>"
---

<cleaned markdown body>
```

Manifest (title · slug · start · end · location · details URL · image URL · img ext):

1. **Ball of Wisdom – A Leadership & Legacy Gathering by M2D** · `ball-of-wisdom-2026` · `2026-05-14T18:00:00` · `2026-05-14T21:00:00` · "Renaissance New York Chelsea Hotel, 112 W 25th St, New York, NY 10001" · `https://luma.com/ga27baq8` · `https://static.wixstatic.com/media/97c220_262fa25891c646d2bc71efb9a0e75b2b~mv2.jpg` · jpg · excerpt: "A leadership & legacy gathering by M2D in New York City."
2. **Money Conversations: Mentorship & the Future of Wealth** · `money-conversations-future-of-wealth` · `2026-03-31T17:30:00` · `2026-03-31T20:00:00` · "One World Trade Center, New York, NY" · `https://luma.com/30902sn0` · `https://static.wixstatic.com/media/97c220_4e4695d9840244c19401e89cdbef5f97~mv2.png` · png · excerpt: "Mentorship and the future of wealth, at One World Trade Center."
3. **Careers Are Assets: Negotiating Pivotal Moments with Strategy & Confidence** · `careers-are-assets` · `2026-03-19T19:00:00` · `2026-03-19T21:00:00` · "Webinar" · `https://www.motherstodaughters.org/event-details/careers-are-assets-negotiating-pivotal-moments-with-strategy-confidence` · `https://static.wixstatic.com/media/97c220_424ebd5cdefb43e5b566fc6c6fae2cbd~mv2.png` · png · excerpt: "Negotiating pivotal career moments with strategy and confidence."
4. **The Mothers to Daughters (M2D) Legacy Walk** · `m2d-legacy-walk` · `2026-02-10T18:00:00` · `2026-02-10T21:00:00` · "256 W 37th St, New York, NY 10018" · `https://www.motherstodaughters.org/event-details/the-mothers-to-daughters-m2d-legacy-walk` · `https://static.wixstatic.com/media/88628d_8ca895bf89084349acb6ddc474d85564~mv2.png` · png · excerpt: "The M2D Legacy Walk in New York City."
5. **Date With Daughters Launch (Women Only)** · `date-with-daughters-launch` · `2026-01-21T19:00:00` · `2026-01-21T21:00:00` · "TBD" · `https://www.motherstodaughters.org/event-details/date-with-daughters-launch-women-only` · `https://static.wixstatic.com/media/88628d_22fbb0d5fd624f778a79c807910ae78f~mv2.jpg` · jpg · excerpt: "The launch of Date With Daughters (women only)."

Example image download:
```bash
curl -L -o public/images/events/ball-of-wisdom-2026.jpg "https://static.wixstatic.com/media/97c220_262fa25891c646d2bc71efb9a0e75b2b~mv2.jpg"
```
If a download produces a zero-byte or error file, delete it and omit the `image` key for that event.

- [ ] **Step 1:** Download the 5 images (per the manifest URLs). Verify each is non-zero; omit `image` for any that failed.
- [ ] **Step 2:** Fetch + write MDX for events 1–3.
- [ ] **Step 3:** Fetch + write MDX for events 4–5.
- [ ] **Step 4: Verify**

Run: `ls content/events/*.mdx | wc -l` — expect **7** (5 new + 2 existing Mentors Mixer). Confirm each new file has valid frontmatter + a body.

- [ ] **Step 5: Commit**

```bash
git add content/events/ public/images/events/
git commit -m "Rip 5 live events into MDX with images and bodies"
```

---

### Task 4: Detail page polish + full build verification

**Files:**
- Modify: `src/app/(site)/events/[slug]/page.tsx`

**Interfaces:**
- Consumes: `formatEventWhen` (Task 1); existing `getEventBySlug`.

- [ ] **Step 1: Show date-time + fix the RSVP label on the detail page**

In `src/app/(site)/events/[slug]/page.tsx`:
- Add `import { formatEventWhen } from '@/lib/event-format';` with the other imports.
- Replace the `<time …>…</time>` block (the one using `toLocaleDateString` with the `endDate` ternary) with:

```tsx
              <time className={styles.date} dateTime={event.frontmatter.date}>
                {formatEventWhen(event.frontmatter.date, event.frontmatter.endDate)}
              </time>
```

- Change the RSVP button label from `RSVP on Zeffy` to `View Details ↗` (the link points to an external Luma / event-details page, not Zeffy). Leave the `href={event.frontmatter.rsvpUrl}` and `target`/`rel` as-is.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Full build**

Stop any running dev server first (`taskkill //F //IM node.exe` — ignore "not found"), then `rm -rf .next`, then:
Run: `npx next build`
Expected: compiles; route list includes `/events` and `/events/[slug]` enumerating all 7 slugs; no `react/no-unescaped-entities` or MDX parse errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(site)/events/[slug]/page.tsx"
git commit -m "Show event date-time range on detail page; fix RSVP/Details label"
```

---

## Final verification (after all tasks)

- [ ] `npx vitest run` — all suites pass (including `event-format.test.ts`).
- [ ] `npx tsc --noEmit` — clean.
- [ ] `npx next build` — compiles; `/events` + all `/events/[slug]` routes build.
- [ ] `ls content/events/*.mdx | wc -l` → 7.
- [ ] Manual (dev server): `/events` shows the hero image + verbatim intro; Upcoming lists the 2026 events with date-time/location/"RSVP Closed"/More info/Details; Past lists the Mentors Mixer events; Load More appears only when a section exceeds 6; the Mentors Mixer callout remains.
- [ ] Restart the dev server for QA.
