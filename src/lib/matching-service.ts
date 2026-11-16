import { createAdminClient } from './supabase/admin';
import { getMenteeAccess } from './access';
import {
  rankMentors,
  hasCapacity,
  assessConfidence,
  type MatchConfidence,
  type MentorForMatch,
  type MentorScore,
} from './matching';
import { MATCH_PROFILE_COLUMNS, toMatchProfile, type MatchProfileRow } from './match-profile';
import { aiRankMentors, getAiConfig, type AiRankResult, type AiStatus } from './ai-matching';

/** How many ranked candidates an admin sees in the review queue. */
const REVIEW_CANDIDATES = 3;
/** How many eligible mentors the AI step may choose between. */
const AI_CANDIDATES = 8;

export type SuggestionCandidate = Pick<
  MentorScore,
  'mentorId' | 'score' | 'kind' | 'matched' | 'breakdown' | 'keywords' | 'completeness'
> & {
  activeMenteeCount: number;
  maxMentees: number | null;
};

export type AutoMatchResult = {
  matched: boolean;
  mentorId?: string;
  confidence?: MatchConfidence;
  aiStatus?: AiStatus;
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
 *   1. Weighted rule-based score (see matching.ts). A strong, complete, clear
 *      winner is assigned immediately.
 *   2. A partial fit goes to the optional AI step, but only when enough mentors
 *      have room; its pick is assigned only at or above the configured confidence.
 *   3. Everything else (no fit, small pool, or any AI fallback) is queued in
 *      match_suggestions for an admin, with the reasons.
 * Every decision is logged there so auto-resolution and override rates can be measured.
 */
export async function autoMatchMentee(
  menteeId: string,
  { allowAi = true }: { allowAi?: boolean } = {}
): Promise<AutoMatchResult> {
  try {
    const admin = createAdminClient();

    const { data: mentee } = await admin
      .from('user_profiles')
      .select(`role, business_experience, ${MATCH_PROFILE_COLUMNS}`)
      .eq('id', menteeId)
      .single<MatchProfileRow & { role: string; business_experience: string | null }>();

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
        .select(`id, max_mentees, ${MATCH_PROFILE_COLUMNS}`)
        .eq('role', 'mentor')
        .returns<(MatchProfileRow & { id: string; max_mentees: number | null })[]>(),
      getActiveMenteeCounts(admin),
    ]);

    const mentors: MentorForMatch[] = (mentorRows ?? []).map((m) => ({
      ...toMatchProfile(m, 'mentor'),
      id: m.id,
      activeMenteeCount: counts[m.id] ?? 0,
      maxMentees: m.max_mentees ?? null,
    }));
    const byId = new Map(mentors.map((m) => [m.id, m]));
    const eligible = mentors.filter(hasCapacity);

    const menteeProfile = toMatchProfile(mentee, 'mentee');
    const ranked = rankMentors(menteeProfile, eligible);
    const assessment = assessConfidence(ranked);
    const confidence = assessment.level;
    const top = ranked[0];

    const { data: pending } = await admin
      .from('match_suggestions')
      .select('id, ai_status, ai_model, ai_confidence, ai_reason, suggested_mentor_id')
      .eq('mentee_id', menteeId)
      .eq('status', 'pending')
      .maybeSingle();

    // AI only helps with a partial fit; with no fit at all a person decides.
    let ai: AiRankResult = { status: 'not_needed' };
    if (confidence === 'low' && pending?.ai_status === 'used') {
      // The AI already gave its opinion on this open review; don't pay for it again.
      ai = {
        status: 'used',
        model: pending.ai_model ?? undefined,
        confidence: pending.ai_confidence ?? undefined,
        reason: pending.ai_reason ?? undefined,
        // Reuse the AI's pick only if it was a real pick and that mentor still has room.
        mentorId:
          (pending.ai_confidence ?? 0) > 0 &&
          ranked.some((r) => r.mentorId === pending.suggested_mentor_id)
            ? pending.suggested_mentor_id
            : undefined,
      };
    } else if (confidence === 'low' && !allowAi) {
      ai = { status: 'skipped' };
    } else if (confidence === 'low') {
      ai = await aiRankMentors(
        admin,
        { ...menteeProfile, businessExperience: mentee.business_experience ?? null },
        ranked.slice(0, AI_CANDIDATES).map((r) => byId.get(r.mentorId)!)
      );
    }
    const aiPick = ai.status === 'used' ? ai.mentorId : undefined;
    const aiConfident =
      aiPick !== undefined && (ai.confidence ?? 0) >= getAiConfig().minConfidence;
    const aiFields = {
      ai_status: ai.status,
      ai_model: ai.model ?? null,
      ai_confidence: ai.confidence ?? null,
      ai_reason: ai.reason ?? null,
    };

    // Admins see the rule-based top picks, plus the AI's pick if it isn't among them.
    const shown = ranked.slice(0, REVIEW_CANDIDATES);
    const aiRanked = aiPick ? ranked.find((r) => r.mentorId === aiPick) : undefined;
    if (aiRanked && !shown.includes(aiRanked)) shown.unshift(aiRanked);
    const candidates: SuggestionCandidate[] = shown.map((r) => ({
      mentorId: r.mentorId,
      score: r.score,
      kind: r.kind,
      matched: r.matched,
      breakdown: r.breakdown,
      keywords: r.keywords,
      completeness: r.completeness,
      activeMenteeCount: byId.get(r.mentorId)?.activeMenteeCount ?? 0,
      maxMentees: byId.get(r.mentorId)?.maxMentees ?? null,
    }));
    const scoreFields = {
      match_score: assessment.score,
      confidence_reasons: assessment.reasons,
    };

    const assignTo =
      confidence === 'high' && top ? top.mentorId : aiConfident ? aiPick : undefined;

    if (assignTo) {
      const { data: mentorship, error } = await admin
        .from('mentorships')
        .insert({ mentor_id: assignTo, mentee_id: menteeId, status: 'active' })
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
        ...scoreFields,
        ...aiFields,
        suggested_mentor_id: assignTo,
        chosen_mentor_id: assignTo,
        mentorship_id: mentorship.id,
        status: confidence === 'high' ? 'auto_assigned' : 'ai_assigned',
        decided_at: now,
      });
      if (closeError || logError) {
        console.error('[autoMatchMentee] log', closeError ?? logError);
      }

      return { matched: true, mentorId: assignTo, confidence, aiStatus: ai.status };
    }

    // Not confident enough to assign: queue (or refresh) a review for an admin.
    const suggestion = {
      candidates,
      confidence,
      ...scoreFields,
      ...aiFields,
      suggested_mentor_id: aiPick ?? (top && top.kind !== 'none' ? top.mentorId : null),
      updated_at: new Date().toISOString(),
    };
    const { error: queueError } = pending
      ? await admin.from('match_suggestions').update(suggestion).eq('id', pending.id)
      : await admin
          .from('match_suggestions')
          .insert({ ...suggestion, mentee_id: menteeId, status: 'pending' });
    if (queueError) {
      console.error('[autoMatchMentee] queue', queueError);
      return { matched: false, reason: 'error' };
    }

    return { matched: false, reason: 'queued', confidence, aiStatus: ai.status };
  } catch (error) {
    console.error('[autoMatchMentee]', error);
    return { matched: false, reason: 'error' };
  }
}
