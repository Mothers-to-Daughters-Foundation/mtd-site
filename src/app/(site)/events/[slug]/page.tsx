import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Markdown from '@/components/ui/Markdown';
import { getEventBySlug, getAllEvents } from '@/lib/mdx';

interface EventPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const events = getAllEvents();
  return events.map((event) => ({
    slug: event.slug,
  }));
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const event = getEventBySlug(params.slug);

  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  return {
    title: event.frontmatter.title,
    description: event.frontmatter.excerpt || `Join us for ${event.frontmatter.title}`,
  };
}

export default function EventPage({ params }: EventPageProps) {
  const event = getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  return (
    <Section spacing="lg">
      <Container>
        <article>
          <header>
            <h1>{event.frontmatter.title}</h1>
            <time dateTime={event.frontmatter.date}>
              {new Date(event.frontmatter.date).toLocaleDateString()}
            </time>
            {event.frontmatter.endDate && (
              <time dateTime={event.frontmatter.endDate}>
                - {new Date(event.frontmatter.endDate).toLocaleDateString()}
              </time>
            )}
            {event.frontmatter.location && (
              <p>Location: {event.frontmatter.location}</p>
            )}
          </header>
          <Markdown content={event.content} />
          {event.frontmatter.rsvpUrl && (
            <Button
              href={event.frontmatter.rsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="lg"
            >
              RSVP on Zeffy
            </Button>
          )}
        </article>
      </Container>
    </Section>
  );
}
