import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { getAllNews } from '@/lib/mdx';

export const metadata: Metadata = {
  title: 'News',
  description: 'Latest news and updates.',
};

export default function NewsPage() {
  const news = getAllNews();

  return (
    <Section spacing="lg">
      <Container>
        <h1>News</h1>
        {news.length === 0 ? (
          <p>No news items yet. Check back soon!</p>
        ) : (
          <div className="news-grid">
            {news.map((item) => (
              <Card key={item.slug} href={`/news/${item.slug}`}>
                <h2>{item.frontmatter.title}</h2>
                {item.frontmatter.excerpt && <p>{item.frontmatter.excerpt}</p>}
                <time dateTime={item.frontmatter.date}>
                  {new Date(item.frontmatter.date).toLocaleDateString()}
                </time>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
