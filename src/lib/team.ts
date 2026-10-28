import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Team member bios live in content/team/<slug>.md (frontmatter + markdown body).
const teamDirectory = path.join(process.cwd(), 'content', 'team');

export interface TeamLink {
  label: string;
  url: string;
}

export interface TeamBioFrontmatter {
  name: string;
  role?: string;
  group?: string;
  location?: string;
  image?: string;
  /** Heading shown above the bio, e.g. "Her Story" or "His Story". */
  storyHeading?: string;
  links?: TeamLink[];
  /** false = bio page exists but the person is not shown on /team. */
  listed?: boolean;
  /** Original Wix path, kept for redirect bookkeeping. */
  wixUrl?: string;
}

export interface TeamBio {
  slug: string;
  frontmatter: TeamBioFrontmatter;
  content: string;
}

export function getTeamBioSlugs(): string[] {
  try {
    return fs
      .readdirSync(teamDirectory)
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}

export function getTeamBioBySlug(slug: string): TeamBio | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const raw = fs.readFileSync(path.join(teamDirectory, `${slug}.md`), 'utf8');
    const { data, content } = matter(raw);
    return { slug, frontmatter: data as TeamBioFrontmatter, content };
  } catch {
    return null;
  }
}

export function getAllTeamBios(): TeamBio[] {
  return getTeamBioSlugs()
    .map((slug) => getTeamBioBySlug(slug))
    .filter((bio): bio is TeamBio => bio !== null);
}

/** First paragraph of a bio, trimmed to roughly `max` characters, for meta descriptions. */
export function bioExcerpt(content: string, max = 160): string {
  const first = content.trim().split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim() ?? '';
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}
