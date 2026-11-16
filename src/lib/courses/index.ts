import { doltamProvider } from './providers/doltam';
import type { Course, CourseProvider } from './types';

export type { Course, CourseProvider } from './types';

/** Every course catalog the site lists. Add API-backed providers here. */
export const COURSE_PROVIDERS: CourseProvider[] = [doltamProvider];

export interface ProviderCatalog {
  id: string;
  name: string;
  courses: Course[];
}

/**
 * Courses grouped by provider, in registration order. A provider that fails
 * (an API down, a bad key) is logged and left out rather than breaking the page.
 */
export async function getCourseCatalog(
  providers: CourseProvider[] = COURSE_PROVIDERS
): Promise<ProviderCatalog[]> {
  const results = await Promise.allSettled(providers.map((p) => p.listCourses()));
  return results.flatMap((result, i) => {
    const provider = providers[i];
    if (result.status === 'rejected') {
      console.error(`[courses] ${provider.id} failed`, result.reason);
      return [];
    }
    const courses = [...result.value].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    );
    return courses.length ? [{ id: provider.id, name: provider.name, courses }] : [];
  });
}

/** Whether a course is open to every member, Free plan included. */
export function isOpenToAll(course: Course): boolean {
  return course.openToAll !== false;
}
