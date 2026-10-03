import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Markdown from '@/components/ui/Markdown';
import styles from '@/components/ui/Article.module.css';
import { getPostBySlug, getAllPosts } from '@/lib/mdx';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <Section spacing="lg">
      <Container>
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.frontmatter.title}</h1>
            <div className={styles.meta}>
              <time className={styles.date} dateTime={post.frontmatter.date}>
                {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {post.frontmatter.category && (
                <span className={styles.category}>
                  {post.frontmatter.category}
                </span>
              )}
            </div>
          </header>
          <Markdown content={post.content} />
        </article>
      </Container>
    </Section>
  );
}
