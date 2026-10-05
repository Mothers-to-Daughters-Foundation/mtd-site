import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { getAllPosts } from '@/lib/mdx';
import { getImagePath } from '@/lib/utils';
import { readingTime } from '@/lib/reading-time';
import styles from '@/components/ui/ContentList.module.css';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Stories, perspectives, and updates from the Mothers to Daughters community.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Blog</h1>
          <p className={styles.heroDescription}>
            Stories, perspectives, and updates from our community.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className={styles.empty}>No blog posts yet. Check back soon!</p>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <Card
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={styles.card}
              >
                <div className={styles.cardImage}>
                  {post.frontmatter.image ? (
                    <Image
                      src={getImagePath(post.frontmatter.image)}
                      alt={post.frontmatter.title}
                      width={400}
                      height={225}
                      className={styles.cardImageContent}
                    />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>
                      <span>Mothers to Daughters</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  {post.frontmatter.category && (
                    <span className={styles.cardCategory}>
                      {post.frontmatter.category}
                    </span>
                  )}
                  <h2 className={styles.cardTitle}>{post.frontmatter.title}</h2>
                  {post.frontmatter.excerpt && (
                    <p className={styles.cardExcerpt}>
                      {post.frontmatter.excerpt}
                    </p>
                  )}
                  <div className={styles.cardDate}>
                    {post.frontmatter.author ? `${post.frontmatter.author} · ` : ''}
                    {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {` · ${readingTime(post.content)} min read`}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
