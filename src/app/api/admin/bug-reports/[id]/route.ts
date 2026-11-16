import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth-guards';

const updateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'wont_fix']),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from('bug_reports')
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq('id', params.id);
  if (error) {
    console.error('[admin/bug-reports PATCH]', error);
    return NextResponse.json({ error: 'Could not update the report.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
