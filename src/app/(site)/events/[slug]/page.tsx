import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Markdown from '@/components/ui/Markdown';
import styles from '@/components/ui/Article.module.css';
import { getEventBySlug, getAllEvents } from '@/lib/mdx';
import { getImagePath } from '@/lib/utils';

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
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{event.frontmatter.title}</h1>
            <div className={styles.meta}>
              <time className={styles.date} dateTime={event.frontmatter.date}>
                {new Date(event.frontmatter.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {event.frontmatter.endDate &&
                  ` – ${new Date(event.frontmatter.endDate).toLocaleDateString(
                    'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}`}
              </time>
              {event.frontmatter.location && (
                <p className={styles.location}>📍 {event.frontmatter.location}</p>
              )}
            </div>
          </header>
          {event.frontmatter.image && (
            <div className={styles.heroImage}>
              <Image
                src={getImagePath(event.frontmatter.image)}
                alt={event.frontmatter.title}
                width={1200}
                height={675}
                className={styles.heroImageContent}
                priority
              />
            </div>
          )}
          <Markdown content={event.content} />
          {event.frontmatter.rsvpUrl && (
            <div className={styles.cta}>
              <Button
                href={event.frontmatter.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                size="lg"
              >
                RSVP on Zeffy
              </Button>
            </div>
          )}
        </article>
      </Container>
    </Section>
  );
}
