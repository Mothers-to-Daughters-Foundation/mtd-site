import { createAdminClient } from './supabase/admin';
import { getMenteeAccess } from './access';
import {
  rankMentors,
  hasCapacity,
  assessConfidence,
  type MatchConfidence,
  type MatchKind,
  type MentorForMatch,
} from './matching';

/** How many ranked candidates an admin sees in the review queue. */
const REVIEW_CANDIDATES = 3;

export type SuggestionCandidate = {
  mentorId: string;
  score: number;
  kind: MatchKind;
  matched: string[];
  activeMenteeCount: number;
  maxMentees: number | null;
};

export type AutoMatchResult = {
  matched: boolean;
  mentorId?: string;
  kind?: MatchKind;
  confidence?: MatchConfidence;
  reason?: 'not_mentee' | 'not_paid' | 'already_matched' | 'queued' | 'error';
};

type AdminClient = ReturnType<typeof createAdminClient>;

/** Active mentee count per mentor. */
export async function getActiveMenteeCounts(admin: AdminClient) {
  const { data: activeMs, error } = await admin
    .from('mentorships')
    .select('mentor_id')
    .eq('status', 'active');
  if (error) throw error;

  const counts: Record<string, number> = {};
  (activeMs ?? []).forEach((m) => {
    counts[m.mentor_id] = (counts[m.mentor_id] ?? 0) + 1;
  });
  return counts;
}

/**
 * Pair a paid mentee with a mentor. Only mentors with spare capacity are considered.
 * A high-confidence match (shared career area) is assigned immediately; anything
 * else is queued in match_suggestions for an admin to approve, override or dismiss.
 * Every decision is logged there so auto-resolution and override rates can be measured.
 */
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

    const [{ data: mentorRows }, counts] = await Promise.all([
      admin
        .from('user_profiles')
        .select('id, career_areas, expertise, max_mentees')
        .eq('role', 'mentor'),
      getActiveMenteeCounts(admin),
    ]);

    const mentors: MentorForMatch[] = (mentorRows ?? []).map((m) => ({
      id: m.id,
      careerAreas: m.career_areas ?? [],
      expertise: m.expertise ?? null,
      activeMenteeCount: counts[m.id] ?? 0,
      maxMentees: m.max_mentees ?? null,
    }));
    const byId = new Map(mentors.map((m) => [m.id, m]));

    const ranked = rankMentors(
      { interests: mentee.interests ?? [], careerGoals: mentee.career_goals ?? [] },
      mentors.filter(hasCapacity)
    );
    const confidence = assessConfidence(ranked);
    const candidates: SuggestionCandidate[] = ranked
      .slice(0, REVIEW_CANDIDATES)
      .map((r) => ({
        ...r,
        activeMenteeCount: byId.get(r.mentorId)?.activeMenteeCount ?? 0,
        maxMentees: byId.get(r.mentorId)?.maxMentees ?? null,
      }));
    const top = ranked[0];

    if (confidence === 'high' && top) {
      const { data: mentorship, error } = await admin
        .from('mentorships')
        .insert({ mentor_id: top.mentorId, mentee_id: menteeId, status: 'active' })
        .select('id')
        .single();
      if (error || !mentorship) {
        console.error('[autoMatchMentee] insert', error);
        return { matched: false, reason: 'error' };
      }

      // Close any open review for this mentee and log the automatic decision.
      // Logging must never undo a successful match, so failures are only reported.
      const now = new Date().toISOString();
      const { error: closeError } = await admin
        .from('match_suggestions')
        .update({ status: 'dismissed', decided_at: now, updated_at: now })
        .eq('mentee_id', menteeId)
        .eq('status', 'pending');
      const { error: logError } = await admin.from('match_suggestions').insert({
        mentee_id: menteeId,
        candidates,
        confidence,
        suggested_mentor_id: top.mentorId,
        chosen_mentor_id: top.mentorId,
        mentorship_id: mentorship.id,
        status: 'auto_assigned',
        decided_at: now,
      });
      if (closeError || logError) {
        console.error('[autoMatchMentee] log', closeError ?? logError);
      }

      return { matched: true, mentorId: top.mentorId, kind: top.kind, confidence };
    }

    // Low or no confidence: queue (or refresh) a review for an admin.
    const suggestion = {
      candidates,
      confidence,
      suggested_mentor_id: top && top.kind !== 'none' ? top.mentorId : null,
      updated_at: new Date().toISOString(),
    };
    const { data: pending } = await admin
      .from('match_suggestions')
      .select('id')
      .eq('mentee_id', menteeId)
      .eq('status', 'pending')
      .maybeSingle();

    const { error: queueError } = pending
      ? await admin.from('match_suggestions').update(suggestion).eq('id', pending.id)
      : await admin
          .from('match_suggestions')
          .insert({ ...suggestion, mentee_id: menteeId, status: 'pending' });
    if (queueError) {
      console.error('[autoMatchMentee] queue', queueError);
      return { matched: false, reason: 'error' };
    }

    return { matched: false, reason: 'queued', confidence };
  } catch (error) {
    console.error('[autoMatchMentee]', error);
    return { matched: false, reason: 'error' };
  }
}
