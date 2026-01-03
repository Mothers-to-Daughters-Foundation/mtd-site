import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
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
        <article>
          <header>
            <h1>{item.frontmatter.title}</h1>
            <time dateTime={item.frontmatter.date}>
              {new Date(item.frontmatter.date).toLocaleDateString()}
            </time>
          </header>
          <div>
            {/* MDX content will be rendered here */}
            <p>MDX rendering will be implemented with proper MDX components.</p>
            <pre>{item.content.substring(0, 200)}...</pre>
          </div>
        </article>
      </Container>
    </Section>
  );
}
