import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { autoMatchMentee } from '@/lib/matching-service';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
