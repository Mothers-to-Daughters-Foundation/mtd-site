import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Link from 'next/link';
import { getAllNews } from '@/lib/mdx';
import { getImagePath } from '@/lib/utils';
import styles from '@/components/ui/ContentList.module.css';
import newsStyles from './page.module.css';

export const metadata: Metadata = {
  title: 'News',
  description: 'The latest news and announcements from Mothers to Daughters.',
};

export default function NewsPage() {
  const news = getAllNews();

  return (
    <Section spacing="lg">
      <Container>
        <div className={newsStyles.introWrap}>
          <div className={newsStyles.heroImage}>
            <Image
              src={getImagePath('/images/news/hero.jpg')}
              alt="Mothers to Daughters newsroom"
              width={573}
              height={621}
              className={newsStyles.heroImageContent}
              priority
            />
          </div>
          <div className={newsStyles.intro}>
            <h1 className={styles.heroTitle}>News</h1>
            <p className={newsStyles.lead}>Stay Inspired. Stay Informed.</p>
            <p>
              Welcome to the M2D Newsroom&mdash;your go-to space for updates,
              insights, and stories shaping the future of women in business,
              leadership, and social impact.
            </p>
            <h2 className={newsStyles.whatTitle}>What You&rsquo;ll Find Here:</h2>
            <ul className={newsStyles.whatList}>
              <li><strong>Program Highlights</strong> &ndash; Success stories and major milestones from our mentorship cohorts</li>
              <li><strong>Community Impact</strong> &ndash; How M2D is empowering women globally through innovation and entrepreneurship</li>
              <li><strong>Voices of Wisdom</strong> &ndash; Thought leadership from our mentors, mentees, and partners</li>
              <li><strong>Announcements &amp; Events</strong> &ndash; Exclusive updates on upcoming programs, networking opportunities, and collaborations</li>
            </ul>
            <p>
              We&rsquo;re not just telling stories&mdash;we&rsquo;re documenting a
              movement. Stay connected, celebrate our wins, and be part of the
              journey.
            </p>
          </div>
        </div>

        {news.length === 0 ? (
          <p className={styles.empty}>No news items yet. Check back soon!</p>
        ) : (
          <ol className={newsStyles.list}>
            {news.map((item) => (
              <li key={item.slug} className={newsStyles.row}>
                <div className={newsStyles.rowText}>
                  <time dateTime={item.frontmatter.date} className={newsStyles.rowDate}>
                    {new Date(item.frontmatter.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </time>
                  <h2 className={newsStyles.rowTitle}>
                    <Link href={`/news/${item.slug}`}>{item.frontmatter.title}</Link>
                  </h2>
                  {item.frontmatter.excerpt && (
                    <p className={newsStyles.rowExcerpt}>{item.frontmatter.excerpt}</p>
                  )}
                  <Link
                    href={`/news/${item.slug}`}
                    className={newsStyles.readMore}
                    aria-label={`Read more: ${item.frontmatter.title}`}
                  >
                    Read More
                  </Link>
                </div>
                {item.frontmatter.image && (
                  <Link href={`/news/${item.slug}`} className={newsStyles.rowImage} tabIndex={-1} aria-hidden="true">
                    <Image
                      src={getImagePath(item.frontmatter.image)}
                      alt=""
                      width={480}
                      height={320}
                      className={newsStyles.rowImageContent}
                    />
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </Container>
    </Section>
  );
}
