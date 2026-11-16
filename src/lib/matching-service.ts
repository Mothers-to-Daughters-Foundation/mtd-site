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
import { aiRankMentors, getAiConfig, type AiRankResult, type AiStatus } from './ai-matching';

/** How many ranked candidates an admin sees in the review queue. */
const REVIEW_CANDIDATES = 3;
/** How many eligible mentors the AI step may choose between. */
const AI_CANDIDATES = 8;

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
 *   1. Rule-based score. A shared career area is assigned immediately.
 *   2. Otherwise the optional AI step ranks the eligible mentors; its pick is
 *      assigned only at or above the configured confidence.
 *   3. Everything else (including any AI fallback: no key, budget used up,
 *      API down) is queued in match_suggestions for an admin.
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
      .select('role, interests, career_goals, business_experience')
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
        .select('id, career_areas, expertise, bio, max_mentees')
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
    const bios = new Map((mentorRows ?? []).map((m) => [m.id, m.bio ?? null]));

    const ranked = rankMentors(
      { interests: mentee.interests ?? [], careerGoals: mentee.career_goals ?? [] },
      mentors.filter(hasCapacity)
    );
    const confidence = assessConfidence(ranked);
    const top = ranked[0];

    const { data: pending } = await admin
      .from('match_suggestions')
      .select('id, ai_status, ai_model, ai_confidence, ai_reason, suggested_mentor_id')
      .eq('mentee_id', menteeId)
      .eq('status', 'pending')
      .maybeSingle();

    let ai: AiRankResult = { status: 'not_needed' };
    if (confidence !== 'high' && ranked.length > 0 && pending?.ai_status === 'used') {
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
    } else if (confidence !== 'high' && ranked.length > 0 && !allowAi) {
      ai = { status: 'skipped' };
    } else if (confidence !== 'high' && ranked.length > 0) {
      ai = await aiRankMentors(
        admin,
        {
          interests: mentee.interests ?? [],
          careerGoals: mentee.career_goals ?? [],
          businessExperience: mentee.business_experience ?? null,
        },
        ranked.slice(0, AI_CANDIDATES).map((r) => ({
          ...byId.get(r.mentorId)!,
          bio: bios.get(r.mentorId) ?? null,
        }))
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
      ...r,
      activeMenteeCount: byId.get(r.mentorId)?.activeMenteeCount ?? 0,
      maxMentees: byId.get(r.mentorId)?.maxMentees ?? null,
    }));

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
        ...aiFields,
        suggested_mentor_id: assignTo,
        chosen_mentor_id: assignTo,
        mentorship_id: mentorship.id,
        status: assignTo === aiPick && confidence !== 'high' ? 'ai_assigned' : 'auto_assigned',
        decided_at: now,
      });
      if (closeError || logError) {
        console.error('[autoMatchMentee] log', closeError ?? logError);
      }

      return {
        matched: true,
        mentorId: assignTo,
        kind: ranked.find((r) => r.mentorId === assignTo)?.kind,
        confidence,
        aiStatus: ai.status,
      };
    }

    // Not confident enough to assign: queue (or refresh) a review for an admin.
    const suggestion = {
      candidates,
      confidence,
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
