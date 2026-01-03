import { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { getAllPosts } from '@/lib/mdx';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest blog posts and updates.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <Section spacing="lg">
      <Container>
        <h1>Blog</h1>
        {posts.length === 0 ? (
          <p>No blog posts yet. Check back soon!</p>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <Card key={post.slug} href={`/blog/${post.slug}`}>
                <h2>{post.frontmatter.title}</h2>
                <p>{post.frontmatter.excerpt}</p>
                <time dateTime={post.frontmatter.date}>
                  {new Date(post.frontmatter.date).toLocaleDateString()}
                </time>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
