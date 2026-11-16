import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { autoMatchMentee } from '@/lib/matching-service';
import { requireAdmin } from '@/lib/auth-guards';

// AI ranking can take a few seconds per mentee; stop calling it near the limit.
export const maxDuration = 60;
const AI_DEADLINE_MS = 45_000;

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
    queued: 0,
    error: 0,
  };
  const startedAt = Date.now();
  for (const m of mentees ?? []) {
    const r = await autoMatchMentee(m.id, {
      allowAi: Date.now() - startedAt < AI_DEADLINE_MS,
    });
    if (r.matched) summary.matched++;
    else if (r.reason) summary[r.reason]++;
  }

  return NextResponse.json({ summary });
}
