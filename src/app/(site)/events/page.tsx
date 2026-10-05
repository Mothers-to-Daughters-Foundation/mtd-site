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
    // Past events in reverse-chronological order (most recent first).
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    )
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
