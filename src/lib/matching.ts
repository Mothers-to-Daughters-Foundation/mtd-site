export type MenteeForMatch = { interests: string[]; careerGoals: string[] };
export type MentorForMatch = {
  id: string;
  careerAreas: string[];
  expertise: string | null;
  activeMenteeCount: number;
};
export type MatchKind = 'deterministic' | 'soft' | 'none';
export type MentorScore = { mentorId: string; score: number; kind: MatchKind };

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

function intersectionCount(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n;
}

export function scoreMentor(
  mentee: MenteeForMatch,
  mentor: MentorForMatch
): MentorScore {
  const det = intersectionCount(normSet(mentee.interests), normSet(mentor.careerAreas));
  if (det > 0) return { mentorId: mentor.id, score: det, kind: 'deterministic' };

  const menteeTokens = tokenSet([...mentee.interests, ...mentee.careerGoals]);
  const mentorTokens = tokenSet([
    ...mentor.careerAreas,
    ...(mentor.expertise ? [mentor.expertise] : []),
  ]);
  const soft = intersectionCount(menteeTokens, mentorTokens);
  if (soft > 0) return { mentorId: mentor.id, score: soft, kind: 'soft' };

  return { mentorId: mentor.id, score: 0, kind: 'none' };
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
