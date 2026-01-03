import { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getAllEvents } from '@/lib/mdx';

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
        <h1>Events</h1>

        {upcoming.length > 0 && (
          <section>
            <h2>Upcoming Events</h2>
            <div className="events-grid">
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

        {past.length > 0 && (
          <section>
            <h2>Past Events</h2>
            <div className="events-grid">
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

        {events.length === 0 && <p>No events scheduled. Check back soon!</p>}
      </Container>
    </Section>
  );
}
