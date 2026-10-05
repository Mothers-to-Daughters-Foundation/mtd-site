import { createClient } from './server';

/** Read a post's view count for display. Returns 0 on any error. */
export async function getPostViews(slug: string): Promise<number> {
  try {
    const supabase = await createClient();
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
