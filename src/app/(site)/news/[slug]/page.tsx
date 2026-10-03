import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Markdown from '@/components/ui/Markdown';
import styles from '@/components/ui/Article.module.css';
import { getNewsBySlug, getAllNews } from '@/lib/mdx';

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

  return (
    <Section spacing="lg">
      <Container>
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{item.frontmatter.title}</h1>
            <div className={styles.meta}>
              <time className={styles.date} dateTime={item.frontmatter.date}>
                {new Date(item.frontmatter.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </header>
          <Markdown content={item.content} />
        </article>
      </Container>
    </Section>
  );
}
