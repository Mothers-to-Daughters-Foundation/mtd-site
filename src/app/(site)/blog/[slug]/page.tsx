import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Markdown from '@/components/ui/Markdown';
import styles from '@/components/ui/Article.module.css';
import post from './post.module.css';
import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import { getImagePath } from '@/lib/utils';
import { readingTime } from '@/lib/reading-time';
import { getPostViews } from '@/lib/supabase/post-views';
import ViewBeacon from './ViewBeacon';

interface BlogPostPageProps {
  params: { slug: string };
}

// ISR: regenerate periodically so the displayed view count reflects increments
// (pure SSG would freeze the count at build time).
export const revalidate = 60;

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const item = getPostBySlug(params.slug);
  if (!item) return { title: 'Post Not Found' };
  return { title: item.frontmatter.title, description: item.frontmatter.excerpt };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const item = getPostBySlug(params.slug);
  if (!item) notFound();

  const minutes = readingTime(item.content);
  const views = await getPostViews(params.slug);
  const recent = getAllPosts()
    .filter((p) => p.slug !== params.slug)
    .slice(0, 3);

  return (
    <Section spacing="lg">
      <Container>
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{item.frontmatter.title}</h1>
            <div className={styles.meta}>
              {item.frontmatter.author && <span>{item.frontmatter.author}</span>}
              <time className={styles.date} dateTime={item.frontmatter.date}>
                {new Date(item.frontmatter.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span>{minutes} min read</span>
              {item.frontmatter.category && (
                <span className={styles.category}>{item.frontmatter.category}</span>
              )}
              <span className={post.views}>
                {views} {views === 1 ? 'view' : 'views'}
              </span>
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
        </article>

        {recent.length > 0 && (
          <aside className={post.recent}>
            <h2 className={post.recentTitle}>Recent Posts</h2>
            <ul className={post.recentList}>
              {recent.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`}>{p.frontmatter.title}</Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <ViewBeacon slug={params.slug} />
      </Container>
    </Section>
  );
}
