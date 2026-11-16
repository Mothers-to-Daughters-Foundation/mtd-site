/** One course as shown in the catalog, whichever provider it comes from. */
export interface Course {
  /** Unique across providers, e.g. "doltam:personal-brand". */
  id: string;
  title: string;
  description: string;
  /** Where the member enrolls or starts the course (opens in a new tab). */
  url: string;
  providerId: string;
  providerName: string;
  /** Free to every member, Free plan included. Defaults to true. */
  openToAll?: boolean;
  featured?: boolean;
  imageUrl?: string;
  /** Free-text, e.g. "5 lessons" or "Self-paced". */
  length?: string;
}

/**
 * A source of courses. Each partner's catalog (a static list today, an API
 * such as Podia, Thinkific or Teachable later) is one provider, so adding a
 * catalog means adding a provider and registering it in ./index.ts.
 */
export interface CourseProvider {
  id: string;
  name: string;
  listCourses(): Promise<Course[]>;
}
