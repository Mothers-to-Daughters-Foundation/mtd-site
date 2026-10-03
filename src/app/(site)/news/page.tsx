import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { getAllNews } from '@/lib/mdx';
import { getImagePath } from '@/lib/utils';
import styles from '@/components/ui/ContentList.module.css';

export const metadata: Metadata = {
  title: 'News',
  description: 'The latest news and announcements from Mothers to Daughters.',
};

export default function NewsPage() {
  const news = getAllNews();

  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>News</h1>
          <p className={styles.heroDescription}>
            The latest announcements and updates from Mothers to Daughters.
          </p>
        </div>

        {news.length === 0 ? (
          <p className={styles.empty}>No news items yet. Check back soon!</p>
        ) : (
          <div className={styles.grid}>
            {news.map((item) => (
              <Card
                key={item.slug}
                href={`/news/${item.slug}`}
                className={styles.card}
              >
                <div className={styles.cardImage}>
                  {item.frontmatter.image ? (
                    <Image
                      src={getImagePath(item.frontmatter.image)}
                      alt={item.frontmatter.title}
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
                  <h2 className={styles.cardTitle}>{item.frontmatter.title}</h2>
                  {item.frontmatter.excerpt && (
                    <p className={styles.cardExcerpt}>
                      {item.frontmatter.excerpt}
                    </p>
                  )}
                  <time dateTime={item.frontmatter.date} className={styles.cardDate}>
                    {new Date(item.frontmatter.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
