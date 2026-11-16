import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Image from 'next/image';
import Markdown from '@/components/ui/Markdown';
import styles from '@/components/ui/Article.module.css';
import { getNewsBySlug, getAllNews } from '@/lib/mdx';
import { getImagePath } from '@/lib/utils';

interface NewsPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const news = getAllNews();
  return news.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: NewsPageProps): Promise<Metadata> {
  const item = getNewsBySlug(params.slug);

  if (!item) {
    return {
      title: 'News Item Not Found',
    };
  }

  return {
    title: item.frontmatter.title,
    description: item.frontmatter.excerpt,
  };
}

export default function NewsItemPage({ params }: NewsPageProps) {
  const item = getNewsBySlug(params.slug);

  if (!item) {
    notFound();
  }

  // Newest first, as on the News page: "previous" is newer, "next" is older.
  const all = getAllNews();
  const index = all.findIndex((n) => n.slug === item.slug);
  const newer = index > 0 ? all[index - 1] : null;
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : null;

  return (
    <Section spacing="lg">
      <Container>
        <article className={styles.article}>
          <Link href="/news" className={styles.back}>
            ← Back to News
          </Link>
          <header className={styles.header}>
            <h1 className={styles.title}>{item.frontmatter.title}</h1>
            <div className={styles.meta}>
              <time className={styles.date} dateTime={item.frontmatter.date}>
                {new Date(item.frontmatter.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </time>
            </div>
          </header>
          {item.frontmatter.image && (
            <div className={styles.heroImage}>
              <Image
                src={getImagePath(item.frontmatter.image)}
                alt={item.frontmatter.title}
                width={1200}
                height={675}
                className={styles.heroImageContent}
                priority
              />
            </div>
          )}
          <Markdown content={item.content} />
          <nav className={styles.pager} aria-label="More news">
            {newer ? (
              <Link href={`/news/${newer.slug}`} className={styles.pagerLink}>
                <span>← Previous</span>
                {newer.frontmatter.title}
              </Link>
            ) : (
              <span />
            )}
            {older && (
              <Link href={`/news/${older.slug}`} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                <span>Next →</span>
                {older.frontmatter.title}
              </Link>
            )}
          </nav>
        </article>
      </Container>
    </Section>
  );
}
