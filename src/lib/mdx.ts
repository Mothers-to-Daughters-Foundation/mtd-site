import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

// Frontmatter interfaces
export interface BlogFrontmatter {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  category?: string;
  tags?: string[];
  image?: string;
}

export interface EventFrontmatter {
  title: string;
  slug: string;
  date: string;
  endDate?: string;
  location?: string;
  rsvpUrl?: string;
  excerpt?: string;
  image?: string;
}

export interface NewsFrontmatter {
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  image?: string;
}

export interface PageFrontmatter {
  title: string;
  slug: string;
  description?: string;
}

// Generic content item
export interface ContentItem<T> {
  frontmatter: T;
  content: string;
  slug: string;
}

// Helper to get all files from a directory
function getFiles(dir: string): string[] {
  try {
    const fullPath = path.join(contentDirectory, dir);
    return fs.readdirSync(fullPath).filter((file) => file.endsWith('.mdx'));
  } catch {
    return [];
  }
}

// Helper to read and parse MDX file
function getFileContent<T>(
  filePath: string,
  slug: string
): ContentItem<T> | null {
  try {
    const fullPath = path.join(contentDirectory, filePath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      frontmatter: data as T,
      content,
      slug,
    };
  } catch {
    return null;
  }
}

// Blog posts
export function getAllPosts(): ContentItem<BlogFrontmatter>[] {
  const files = getFiles('blog');
  const posts = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      return getFileContent<BlogFrontmatter>(`blog/${file}`, slug);
    })
    .filter((post): post is ContentItem<BlogFrontmatter> => post !== null)
    .sort((a, b) => {
      const dateA = new Date(a.frontmatter.date).getTime();
      const dateB = new Date(b.frontmatter.date).getTime();
      return dateB - dateA;
    });

  return posts;
}

export function getPostBySlug(slug: string): ContentItem<BlogFrontmatter> | null {
  return getFileContent<BlogFrontmatter>(`blog/${slug}.mdx`, slug);
}

// Events
export function getAllEvents(): ContentItem<EventFrontmatter>[] {
  const files = getFiles('events');
  const events = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      return getFileContent<EventFrontmatter>(`events/${file}`, slug);
    })
    .filter((event): event is ContentItem<EventFrontmatter> => event !== null)
    .sort((a, b) => {
      const dateA = new Date(a.frontmatter.date).getTime();
      const dateB = new Date(b.frontmatter.date).getTime();
      return dateA - dateB; // Sort by date ascending (upcoming first)
    });

  return events;
}

export function getEventBySlug(slug: string): ContentItem<EventFrontmatter> | null {
  return getFileContent<EventFrontmatter>(`events/${slug}.mdx`, slug);
}

// News
export function getAllNews(): ContentItem<NewsFrontmatter>[] {
  const files = getFiles('news');
  const news = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      return getFileContent<NewsFrontmatter>(`news/${file}`, slug);
    })
    .filter((item): item is ContentItem<NewsFrontmatter> => item !== null)
    .sort((a, b) => {
      const dateA = new Date(a.frontmatter.date).getTime();
      const dateB = new Date(b.frontmatter.date).getTime();
      return dateB - dateA;
    });

  return news;
}

export function getNewsBySlug(slug: string): ContentItem<NewsFrontmatter> | null {
  return getFileContent<NewsFrontmatter>(`news/${slug}.mdx`, slug);
}

// Pages
export function getPageBySlug(slug: string): ContentItem<PageFrontmatter> | null {
  return getFileContent<PageFrontmatter>(`pages/${slug}.mdx`, slug);
}
