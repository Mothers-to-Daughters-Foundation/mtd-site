/**
 * Deterministic mentor matching.
 *
 * Mentees and mentors answer the same questions from the same option lists, so
 * each question is scored as the share of the mentee's answers the mentor also
 * picked. Questions are weighted (success is deliberately light), questions the
 * mentee skipped are left out, and free text only adds a small keyword bonus.
 */

export const CATEGORY_WEIGHTS = {
  interests: 0.3,
  careerGoals: 0.25,
  motivations: 0.2,
  opportunityValues: 0.15,
  successValues: 0.1,
} as const;

export type CategoryKey = keyof typeof CATEGORY_WEIGHTS;
export const CATEGORY_KEYS = Object.keys(CATEGORY_WEIGHTS) as CategoryKey[];

/** Free text can lift a score by at most this much. */
export const KEYWORD_BONUS_MAX = 0.05;
const KEYWORD_BONUS_PER_MATCH = 0.01;

/** Score bands for labelling a single mentor. */
export const STRONG_SCORE = 0.5;
export const PARTIAL_SCORE = 0.2;

/** When the top match is good enough to assign without a person. */
export const CONFIDENCE_RULES = {
  /** Top mentor's score. */
  autoAssignScore: 0.6,
  /** Lead over the runner-up; a close race goes to review. */
  minMargin: 0.08,
  /** Share of the question weight that both people answered. */
  minCompleteness: 0.6,
};

export type MatchProfile = Record<CategoryKey, string[]> & {
  /** Optional "other" answers and notes; mentors add expertise and bio. */
  freeText: string[];
};

export type MenteeForMatch = MatchProfile;

export type MentorForMatch = MatchProfile & {
  id: string;
  activeMenteeCount: number;
  /** null = no limit */
  maxMentees: number | null;
};

export type MatchKind = 'strong' | 'partial' | 'none';

export type CategoryResult = { overlap: number; matched: string[] };

export type MentorScore = {
  mentorId: string;
  /** 0–1 */
  score: number;
  kind: MatchKind;
  /** Every shared answer, for display. */
  matched: string[];
  breakdown: Partial<Record<CategoryKey, CategoryResult>>;
  keywords: string[];
  /** Share of question weight answered by both the mentee and this mentor. */
  completeness: number;
};

/**
 * high: assign automatically.
 * low: some fit, but not decisive (AI may help when the pool is big enough).
 * none: no meaningful fit, or no mentor with room; an admin decides.
 */
export type MatchConfidence = 'high' | 'low' | 'none';

export type ConfidenceAssessment = {
  level: MatchConfidence;
  score: number;
  margin: number | null;
  completeness: number;
  reasons: string[];
};

const normalize = (s: string) => s.trim().toLowerCase();

function normSet(values: string[]): Set<string> {
  return new Set(values.map(normalize).filter(Boolean));
}

const STOPWORDS = new Set(
  'about after again also and any are because been being but can could did does doing for from had has have her hers him his how into its just like more most much my not now off once only other our out over own same she should some such than that the their them then there these they this those through too under until very was were what when where which while who why will with would you your want help work really make get'.split(
    ' '
  )
);

/** Meaningful lowercase words (4+ letters, no stopwords). */
export function keywordSet(texts: string[]): Set<string> {
  const out = new Set<string>();
  for (const text of texts) {
    for (const word of text.toLowerCase().split(/[^a-z0-9]+/)) {
      if (word.length >= 4 && !STOPWORDS.has(word)) out.add(word);
    }
  }
  return out;
}

export function hasCapacity(mentor: MentorForMatch): boolean {
  return mentor.maxMentees == null || mentor.activeMenteeCount < mentor.maxMentees;
}

const round = (n: number) => Math.round(n * 1000) / 1000;

export function scoreMentor(mentee: MenteeForMatch, mentor: MentorForMatch): MentorScore {
  const breakdown: MentorScore['breakdown'] = {};
  const matched: string[] = [];
  let weighted = 0;
  let answeredWeight = 0;
  let bothWeight = 0;
  let totalWeight = 0;

  for (const key of CATEGORY_KEYS) {
    const weight = CATEGORY_WEIGHTS[key];
    totalWeight += weight;
    const wants = normSet(mentee[key]);
    if (wants.size === 0) continue; // mentee skipped this question

    const offers = new Map(mentor[key].map((v) => [normalize(v), v.trim()]));
    const shared = [...wants].filter((v) => offers.has(v)).map((v) => offers.get(v)!);
    const overlap = shared.length / wants.size;

    breakdown[key] = { overlap: round(overlap), matched: shared };
    matched.push(...shared);
    weighted += weight * overlap;
    answeredWeight += weight;
    if (offers.size > 0) bothWeight += weight;
  }

  const base = answeredWeight > 0 ? weighted / answeredWeight : 0;

  const mentorWords = keywordSet(mentor.freeText);
  const keywords = [...keywordSet(mentee.freeText)].filter((w) => mentorWords.has(w));
  const bonus = Math.min(KEYWORD_BONUS_MAX, keywords.length * KEYWORD_BONUS_PER_MATCH);

  const score = round(Math.min(1, base + bonus));
  return {
    mentorId: mentor.id,
    score,
    kind: score >= STRONG_SCORE ? 'strong' : score >= PARTIAL_SCORE ? 'partial' : 'none',
    matched,
    breakdown,
    keywords,
    completeness: round(totalWeight > 0 ? bothWeight / totalWeight : 0),
  };
}

/** Best first; ties go to the mentor with fewer active mentees. */
export function rankMentors(mentee: MenteeForMatch, mentors: MentorForMatch[]): MentorScore[] {
  const load = new Map(mentors.map((m) => [m.id, m.activeMenteeCount]));
  return mentors
    .map((m) => scoreMentor(mentee, m))
    .sort(
      (a, b) =>
        b.score - a.score || (load.get(a.mentorId) ?? 0) - (load.get(b.mentorId) ?? 0)
    );
}

export function assessConfidence(ranked: MentorScore[]): ConfidenceAssessment {
  const [top, second] = ranked;
  if (!top) {
    return {
      level: 'none',
      score: 0,
      margin: null,
      completeness: 0,
      reasons: ['No mentor currently has room.'],
    };
  }

  const margin = second ? round(top.score - second.score) : null;
  const base = { score: top.score, margin, completeness: top.completeness };

  if (top.score < PARTIAL_SCORE) {
    return { ...base, level: 'none', reasons: ['No mentor shares enough of these answers.'] };
  }

  const reasons: string[] = [];
  if (top.score < CONFIDENCE_RULES.autoAssignScore) {
    reasons.push(`Best match is ${Math.round(top.score * 100)}%, below the 60% needed to assign automatically.`);
  }
  if (top.completeness < CONFIDENCE_RULES.minCompleteness) {
    reasons.push('Too few questions were answered by both people to be sure.');
  }
  if (margin !== null && margin < CONFIDENCE_RULES.minMargin) {
    reasons.push('Two or more mentors are almost equally good.');
  }

  return { ...base, level: reasons.length === 0 ? 'high' : 'low', reasons };
}
