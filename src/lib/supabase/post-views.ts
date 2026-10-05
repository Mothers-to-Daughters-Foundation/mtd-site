import { createServerClient } from '@supabase/ssr';

/** Read a post's view count for display. Returns 0 on any error.
 *  Cookieless so the blog can be statically exported for GitHub Pages.
 */
export async function getPostViews(slug: string): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return 0;

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });
    const { data } = await supabase
      .from('post_views')
      .select('views')
      .eq('slug', slug)
      .maybeSingle();
    return data?.views ?? 0;
  } catch {
    return 0;
  }
}
