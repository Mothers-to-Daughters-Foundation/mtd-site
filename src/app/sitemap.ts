import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/mdx';
import { getAllEvents } from '@/lib/mdx';
import { getAllNews } from '@/lib/mdx';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Blog posts
  const blogPosts = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Events
  const events = getAllEvents().map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: new Date(event.frontmatter.date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // News items
  const newsItems = getAllNews().map((item) => ({
    url: `${baseUrl}/news/${item.slug}`,
    lastModified: new Date(item.frontmatter.date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPosts, ...events, ...newsItems];
}
