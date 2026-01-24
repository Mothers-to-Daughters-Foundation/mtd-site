import { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getAllEvents } from '@/lib/mdx';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming and past events.',
};

export default function EventsPage() {
  const events = getAllEvents();
  const now = new Date();
  const upcoming = events.filter(
    (event) => new Date(event.frontmatter.date) >= now
  );
  const past = events.filter(
    (event) => new Date(event.frontmatter.date) < now
  );

  return (
    <Section spacing="lg">
      <Container>
        <h1 className={styles.pageTitle}>Events</h1>

        {upcoming.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Upcoming Events</h2>
            <div className={styles.eventsGrid}>
              {upcoming.map((event) => (
                <Card key={event.slug} href={`/events/${event.slug}`}>
                  <h3>{event.frontmatter.title}</h3>
                  <p>{event.frontmatter.excerpt}</p>
                  <time dateTime={event.frontmatter.date}>
                    {new Date(event.frontmatter.date).toLocaleDateString()}
                  </time>
                  {event.frontmatter.location && (
                    <p>Location: {event.frontmatter.location}</p>
                  )}
                  {event.frontmatter.rsvpUrl && (
                    <Button
                      href={event.frontmatter.rsvpUrl}
                      variant="primary"
                      size="sm"
                    >
                      RSVP
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Mentors Mixer</h2>
          <Card href="/mentors-mixer" className={styles.mentorsMixerCard}>
            <h3>Mentors Mixer</h3>
            <p>Connect with fellow mentors and mentees at our signature networking events.</p>
            <Button href="/mentors-mixer" variant="primary" size="md">
              Learn More
            </Button>
          </Card>
        </section>

        {past.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Past Events</h2>
            <div className={styles.eventsGrid}>
              {past.map((event) => (
                <Card key={event.slug} href={`/events/${event.slug}`}>
                  <h3>{event.frontmatter.title}</h3>
                  <p>{event.frontmatter.excerpt}</p>
                  <time dateTime={event.frontmatter.date}>
                    {new Date(event.frontmatter.date).toLocaleDateString()}
                  </time>
                </Card>
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && upcoming.length === 0 && past.length === 0 && (
          <p className={styles.noEvents}>No events scheduled. Check back soon!</p>
        )}
      </Container>
    </Section>
  );
}
