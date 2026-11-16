export type MenteeForMatch = { interests: string[]; careerGoals: string[] };
export type MentorForMatch = {
  id: string;
  careerAreas: string[];
  expertise: string | null;
  activeMenteeCount: number;
  /** null = no limit */
  maxMentees: number | null;
};
export type MatchKind = 'deterministic' | 'soft' | 'none';
/** `matched` lists the shared career areas (deterministic) or words (soft), for display. */
export type MentorScore = {
  mentorId: string;
  score: number;
  kind: MatchKind;
  matched: string[];
};
/**
 * high: an exact career-area match exists, so the top mentor can be assigned automatically.
 * low: only word overlap with free text, so an admin should review.
 * none: no overlap or no mentor with capacity, so an admin must pick.
 */
export type MatchConfidence = 'high' | 'low' | 'none';

function normSet(arr: string[]): Set<string> {
  return new Set(arr.map((s) => s.trim().toLowerCase()).filter(Boolean));
}

function tokenSet(values: string[]): Set<string> {
  const out = new Set<string>();
  for (const v of values) {
    for (const t of v.toLowerCase().split(/[^a-z0-9]+/)) {
      if (t.length > 1) out.add(t);
    }
  }
  return out;
}

function intersection(a: Set<string>, b: Set<string>): string[] {
  const out: string[] = [];
  for (const x of a) if (b.has(x)) out.push(x);
  return out;
}

export function hasCapacity(mentor: MentorForMatch): boolean {
  return mentor.maxMentees == null || mentor.activeMenteeCount < mentor.maxMentees;
}

export function scoreMentor(
  mentee: MenteeForMatch,
  mentor: MentorForMatch
): MentorScore {
  const areas = new Map(mentor.careerAreas.map((a) => [a.trim().toLowerCase(), a.trim()]));
  const det = intersection(normSet(mentee.interests), new Set(areas.keys()));
  if (det.length > 0) {
    return {
      mentorId: mentor.id,
      score: det.length,
      kind: 'deterministic',
      matched: det.map((k) => areas.get(k) ?? k),
    };
  }

  const menteeTokens = tokenSet([...mentee.interests, ...mentee.careerGoals]);
  const mentorTokens = tokenSet([
    ...mentor.careerAreas,
    ...(mentor.expertise ? [mentor.expertise] : []),
  ]);
  const soft = intersection(menteeTokens, mentorTokens);
  if (soft.length > 0) {
    return { mentorId: mentor.id, score: soft.length, kind: 'soft', matched: soft };
  }

  return { mentorId: mentor.id, score: 0, kind: 'none', matched: [] };
}

const KIND_RANK: Record<MatchKind, number> = { deterministic: 2, soft: 1, none: 0 };

export function rankMentors(
  mentee: MenteeForMatch,
  mentors: MentorForMatch[]
): MentorScore[] {
  const counts = new Map(mentors.map((m) => [m.id, m.activeMenteeCount]));
  return mentors
    .map((m) => scoreMentor(mentee, m))
    .sort((a, b) => {
      if (KIND_RANK[b.kind] !== KIND_RANK[a.kind]) {
        return KIND_RANK[b.kind] - KIND_RANK[a.kind];
      }
      if (b.score !== a.score) return b.score - a.score;
      return (counts.get(a.mentorId) ?? 0) - (counts.get(b.mentorId) ?? 0);
    });
}

export function assessConfidence(ranked: MentorScore[]): MatchConfidence {
  const top = ranked[0];
  if (!top || top.kind === 'none') return 'none';
  return top.kind === 'deterministic' ? 'high' : 'low';
}
