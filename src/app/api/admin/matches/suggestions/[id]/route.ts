import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth-guards';
import { createAdminClient } from '@/lib/supabase/admin';

const decisionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('assign'), mentorId: z.string().uuid() }),
  z.object({ action: z.literal('dismiss') }),
]);

/**
 * Resolve a pending match review. Assigning the suggested mentor records
 * 'approved'; assigning anyone else records 'overridden'.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const parsed = decisionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: suggestion } = await admin
      .from('match_suggestions')
      .select('id, mentee_id, suggested_mentor_id, status')
      .eq('id', params.id)
      .maybeSingle();

    if (!suggestion) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    if (suggestion.status !== 'pending') {
      return NextResponse.json({ error: 'This review was already resolved' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const decided = { decided_by: auth.user.id, decided_at: now, updated_at: now };

    if (parsed.data.action === 'dismiss') {
      const { error } = await admin
        .from('match_suggestions')
        .update({ ...decided, status: 'dismissed' })
        .eq('id', suggestion.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    const mentorId = parsed.data.mentorId;
    const { data: mentor } = await admin
      .from('user_profiles')
      .select('role')
      .eq('id', mentorId)
      .maybeSingle();
    if (mentor?.role !== 'mentor') {
      return NextResponse.json({ error: 'Selected user is not a mentor' }, { status: 400 });
    }

    const { data: existing } = await admin
      .from('mentorships')
      .select('id')
      .eq('mentee_id', suggestion.mentee_id)
      .eq('status', 'active')
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: 'This mentee already has an active mentor. Dismiss the review instead.' },
        { status: 409 }
      );
    }

    const { data: mentorship, error: insertError } = await admin
      .from('mentorships')
      .insert({ mentor_id: mentorId, mentee_id: suggestion.mentee_id, status: 'active' })
      .select()
      .single();
    if (insertError || !mentorship) throw insertError ?? new Error('Insert failed');

    const { error: updateError } = await admin
      .from('match_suggestions')
      .update({
        ...decided,
        chosen_mentor_id: mentorId,
        mentorship_id: mentorship.id,
        status: mentorId === suggestion.suggested_mentor_id ? 'approved' : 'overridden',
      })
      .eq('id', suggestion.id);
    if (updateError) console.error('[admin/matches/suggestions POST] log', updateError);

    return NextResponse.json({ ok: true, match: mentorship });
  } catch (error) {
    console.error('[admin/matches/suggestions POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
