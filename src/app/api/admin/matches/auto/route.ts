import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { autoMatchMentee } from '@/lib/matching-service';
import { requireAdmin } from '@/lib/auth-guards';

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  const { data: mentees } = await admin
    .from('user_profiles')
    .select('id')
    .eq('role', 'mentee');

  const summary = {
    matched: 0,
    not_mentee: 0,
    not_paid: 0,
    already_matched: 0,
    no_candidate: 0,
    error: 0,
  };
  for (const m of mentees ?? []) {
    const r = await autoMatchMentee(m.id);
    if (r.matched) summary.matched++;
    else if (r.reason) summary[r.reason]++;
  }

  return NextResponse.json({ summary });
}
