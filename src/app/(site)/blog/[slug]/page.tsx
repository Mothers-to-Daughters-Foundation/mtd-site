import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
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
        <article>
          <header>
            <h1>{post.frontmatter.title}</h1>
            <time dateTime={post.frontmatter.date}>
              {new Date(post.frontmatter.date).toLocaleDateString()}
            </time>
            {post.frontmatter.category && (
              <span>Category: {post.frontmatter.category}</span>
            )}
          </header>
          <div>
            {/* MDX content will be rendered here */}
            <p>MDX rendering will be implemented with proper MDX components.</p>
            <pre>{post.content.substring(0, 200)}...</pre>
          </div>
        </article>
      </Container>
    </Section>
  );
}
