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
