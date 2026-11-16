import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveMenteeCounts } from '@/lib/matching-service';
import { AI_STATUS_LABEL, getAiConfig, getMonthlySpendUsd, type AiStatus } from '@/lib/ai-matching';

/**
 * Pending match reviews (with mentee answers and candidate names) plus the
 * decision metrics: auto-resolution rate, override rate, AI escalation rate,
 * time to pairing, and this month's AI spend against its budget.
 */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const admin = createAdminClient();

    const [{ data: rows, error }, { data: profiles }, counts] = await Promise.all([
      admin
        .from('match_suggestions')
        .select('id, mentee_id, candidates, confidence, suggested_mentor_id, status, created_at, decided_at, ai_status, ai_confidence, ai_reason')
        .order('created_at', { ascending: true }),
      admin
        .from('user_profiles')
        .select('id, full_name, role, interests, career_goals, business_experience, max_mentees')
        .in('role', ['mentor', 'mentee']),
      getActiveMenteeCounts(admin),
    ]);
    if (error) throw error;

    const people = new Map((profiles ?? []).map((p) => [p.id, p]));
    const all = rows ?? [];

    const pending = all
      .filter((r) => r.status === 'pending')
      .map((r) => {
        const mentee = people.get(r.mentee_id);
        return {
          ...r,
          ai_flag: AI_STATUS_LABEL[r.ai_status as AiStatus] ?? '',
          mentee: {
            id: r.mentee_id,
            name: mentee?.full_name ?? 'Unknown',
            interests: mentee?.interests ?? [],
            careerGoals: mentee?.career_goals ?? [],
            businessExperience: mentee?.business_experience ?? null,
          },
          candidates: (r.candidates ?? []).map((c: { mentorId: string }) => ({
            ...c,
            name: people.get(c.mentorId)?.full_name ?? 'Unknown',
          })),
        };
      });

    // Every mentor, for the "assign someone else" picker, with current load.
    const mentors = (profiles ?? [])
      .filter((p) => p.role === 'mentor')
      .map((p) => ({
        id: p.id,
        name: p.full_name ?? 'Unnamed Mentor',
        activeMenteeCount: counts[p.id] ?? 0,
        maxMentees: p.max_mentees ?? null,
      }));

    const tally = {
      auto_assigned: 0,
      ai_assigned: 0,
      approved: 0,
      overridden: 0,
      dismissed: 0,
      pending: 0,
    };
    let aiCalls = 0;
    const hoursToPair: number[] = [];
    for (const r of all) {
      tally[r.status as keyof typeof tally]++;
      if (r.ai_status === 'used') aiCalls++;
      if (r.decided_at && r.status !== 'dismissed') {
        hoursToPair.push(
          (new Date(r.decided_at).getTime() - new Date(r.created_at).getTime()) / 3_600_000
        );
      }
    }
    const reviewed = tally.approved + tally.overridden;
    const automatic = tally.auto_assigned + tally.ai_assigned;
    const paired = automatic + reviewed;
    hoursToPair.sort((a, b) => a - b);

    const metrics = {
      ...tally,
      autoResolutionRate: paired ? automatic / paired : null,
      aiEscalationRate: all.length ? aiCalls / all.length : null,
      overrideRate: reviewed ? tally.overridden / reviewed : null,
      medianHoursToPair: hoursToPair.length
        ? hoursToPair[Math.floor(hoursToPair.length / 2)]
        : null,
    };

    const config = getAiConfig();
    let spentUsd: number | null = null;
    try {
      spentUsd = await getMonthlySpendUsd(admin);
    } catch (e) {
      console.error('[admin/matches/suggestions GET] ai usage', e);
    }
    const ai = {
      enabled: config.enabled,
      model: config.model,
      minConfidence: config.minConfidence,
      budgetUsd: config.monthlyBudgetUsd,
      spentUsd,
      budgetExhausted: spentUsd !== null && spentUsd >= config.monthlyBudgetUsd,
    };

    return NextResponse.json({ pending, mentors, metrics, ai });
  } catch (error) {
    console.error('[admin/matches/suggestions GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
