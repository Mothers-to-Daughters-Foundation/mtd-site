import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const schema = z.object({ slug: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }
    const { slug } = parsed.data;
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from('post_views')
      .select('views')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      const next = (existing.views ?? 0) + 1;
      await admin
        .from('post_views')
        .update({ views: next, updated_at: new Date().toISOString() })
        .eq('slug', slug);
      return NextResponse.json({ views: next });
    }

    await admin.from('post_views').insert({ slug, views: 1 });
    return NextResponse.json({ views: 1 });
  } catch (error) {
    console.error('[blog/views]', error);
    return NextResponse.json({ views: 0 });
  }
}
