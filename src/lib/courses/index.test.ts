import { describe, expect, it, vi } from 'vitest';
import { getCourseCatalog, isOpenToAll, type Course, type CourseProvider } from './index';

const course = (id: string, extra: Partial<Course> = {}): Course => ({
  id,
  title: id,
  description: '',
  url: 'https://example.com',
  providerId: 'p',
  providerName: 'P',
  ...extra,
});

const provider = (id: string, list: () => Promise<Course[]>): CourseProvider => ({
  id,
  name: id.toUpperCase(),
  listCourses: list,
});

describe('getCourseCatalog', () => {
  it('groups by provider, featured first, skipping empty and failing providers', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const catalog = await getCourseCatalog([
      provider('a', async () => [course('a1'), course('a2', { featured: true })]),
      provider('broken', async () => {
        throw new Error('API down');
      }),
      provider('empty', async () => []),
      provider('b', async () => [course('b1')]),
    ]);
    expect(catalog.map((p) => p.id)).toEqual(['a', 'b']);
    expect(catalog[0].courses.map((c) => c.id)).toEqual(['a2', 'a1']);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it('the registered catalog loads', async () => {
    const catalog = await getCourseCatalog();
    expect(catalog.length).toBeGreaterThan(0);
  });
});

describe('isOpenToAll', () => {
  it('defaults to open unless a course opts out', () => {
    expect(isOpenToAll(course('x'))).toBe(true);
    expect(isOpenToAll(course('x', { openToAll: false }))).toBe(false);
  });
});
