import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Markdown from '@/components/ui/Markdown';
import { bioExcerpt, getTeamBioBySlug, getTeamBioSlugs } from '@/lib/team';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

interface TeamBioPageProps {
  params: {
    slug: string;
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getTeamBioSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: TeamBioPageProps): Metadata {
  const bio = getTeamBioBySlug(params.slug);

  if (!bio) {
    return { title: 'Team Member Not Found' };
  }

  const { name, role } = bio.frontmatter;
  return {
    title: role ? `${name}, ${role}` : name,
    description: bioExcerpt(bio.content),
    openGraph: bio.frontmatter.image
      ? { images: [{ url: bio.frontmatter.image, alt: name }] }
      : undefined,
  };
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function TeamBioPage({ params }: TeamBioPageProps) {
  const bio = getTeamBioBySlug(params.slug);

  if (!bio) {
    notFound();
  }

  const { name, role, location, image, storyHeading, links } = bio.frontmatter;

  return (
    <Section spacing="lg">
      <Container>
        <Link href="/team" className={styles.backLink}>
          <span aria-hidden="true">←</span> Back to Our Team
        </Link>

        <article className={styles.profile}>
          <div className={styles.photo}>
            {image ? (
              <Image
                src={getImagePath(image)}
                alt={name}
                width={400}
                height={400}
                className={styles.photoImage}
                priority
              />
            ) : (
              <div className={styles.photoPlaceholder}>
                <span>{initials(name)}</span>
              </div>
            )}
          </div>

          <div className={styles.body}>
            <header className={styles.header}>
              <h1 className={styles.name}>{name}</h1>
              {role && <p className={styles.role}>{role}</p>}
              {location && <p className={styles.location}>{location}</p>}
              {links && links.length > 0 && (
                <ul className={styles.links}>
                  {links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </header>

            <h2 className={styles.storyHeading}>{storyHeading ?? 'Their Story'}</h2>
            <Markdown content={bio.content} className={styles.story} />
          </div>
        </article>
      </Container>
    </Section>
  );
}
