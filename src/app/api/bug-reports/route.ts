import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rateLimit';

const reportSchema = z.object({
  description: z.string().trim().min(10, 'Tell us a little more about what happened.').max(4000),
  contactEmail: z.string().trim().email('Check the email address.').max(200).optional(),
  pageUrl: z.string().trim().max(500).optional(),
  viewport: z.string().trim().max(40).optional(),
  /** Honeypot: hidden from people, so any value means a bot. */
  website: z.string().max(200).optional(),
});

/** Anyone can report a bug, signed in or not. Stored for admins only. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  if (!rateLimit(`bug-report:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many reports. Please try again later.' }, { status: 429 });
  }

  const parsed = reportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  if (parsed.data.website) {
    return NextResponse.json({ ok: true }); // quietly drop bot submissions
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await createAdminClient()
      .from('bug_reports')
      .insert({
        user_id: user?.id ?? null,
        contact_email: parsed.data.contactEmail ?? user?.email ?? null,
        description: parsed.data.description,
        page_url: parsed.data.pageUrl ?? null,
        viewport: parsed.data.viewport ?? null,
        user_agent: req.headers.get('user-agent')?.slice(0, 400) ?? null,
      });
    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('[bug-reports POST]', error);
    return NextResponse.json({ error: 'Could not save the report.' }, { status: 500 });
  }
}
