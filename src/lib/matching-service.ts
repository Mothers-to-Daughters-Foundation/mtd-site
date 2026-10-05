import { createAdminClient } from './supabase/admin';
import { getMenteeAccess } from './access';
import { rankMentors, type MatchKind, type MentorForMatch } from './matching';

export type AutoMatchResult = {
  matched: boolean;
  mentorId?: string;
  kind?: MatchKind;
  reason?: 'not_mentee' | 'not_paid' | 'already_matched' | 'no_candidate' | 'error';
};

export async function autoMatchMentee(menteeId: string): Promise<AutoMatchResult> {
  try {
    const admin = createAdminClient();

    const { data: mentee } = await admin
      .from('user_profiles')
      .select('role, interests, career_goals')
      .eq('id', menteeId)
      .single();

    if (!mentee || mentee.role !== 'mentee') {
      return { matched: false, reason: 'not_mentee' };
    }

    const access = await getMenteeAccess(menteeId);
    if (!access.hasAccess) {
      return { matched: false, reason: 'not_paid' };
    }

    const { data: existing } = await admin
      .from('mentorships')
      .select('id')
      .eq('mentee_id', menteeId)
      .eq('status', 'active')
      .maybeSingle();
    if (existing) {
      return { matched: false, reason: 'already_matched' };
    }

    const { data: mentorRows } = await admin
      .from('user_profiles')
      .select('id, career_areas, expertise')
      .eq('role', 'mentor');

    const { data: activeMs } = await admin
      .from('mentorships')
      .select('mentor_id')
      .eq('status', 'active');

    const counts: Record<string, number> = {};
    (activeMs ?? []).forEach((m) => {
      counts[m.mentor_id] = (counts[m.mentor_id] ?? 0) + 1;
    });

    const mentors: MentorForMatch[] = (mentorRows ?? []).map((m) => ({
      id: m.id,
      careerAreas: m.career_areas ?? [],
      expertise: m.expertise ?? null,
      activeMenteeCount: counts[m.id] ?? 0,
    }));

    const ranked = rankMentors(
      { interests: mentee.interests ?? [], careerGoals: mentee.career_goals ?? [] },
      mentors
    );
    const best = ranked.find((r) => r.kind !== 'none');
    if (!best) {
      return { matched: false, reason: 'no_candidate' };
    }

    const { error } = await admin.from('mentorships').insert({
      mentor_id: best.mentorId,
      mentee_id: menteeId,
      status: 'active',
    });
    if (error) {
      console.error('[autoMatchMentee] insert', error);
      return { matched: false, reason: 'error' };
    }

    return { matched: true, mentorId: best.mentorId, kind: best.kind };
  } catch (error) {
    console.error('[autoMatchMentee]', error);
    return { matched: false, reason: 'error' };
  }
}
