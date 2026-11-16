import { describe, it, expect } from 'vitest';
import {
  scoreMentor,
  rankMentors,
  hasCapacity,
  assessConfidence,
  type MentorForMatch,
} from './matching';

const mentor = (over: Partial<MentorForMatch>): MentorForMatch => ({
  id: 'm', careerAreas: [], expertise: null, activeMenteeCount: 0, maxMentees: null, ...over,
});

describe('scoreMentor', () => {
  it('deterministic: exact interest<->career_area overlap, score = count', () => {
    const r = scoreMentor(
      { interests: ['Finance', 'Leadership'], careerGoals: [] },
      mentor({ id: 'a', careerAreas: ['Finance', 'Leadership', 'Education'] })
    );
    expect(r).toEqual({
      mentorId: 'a',
      score: 2,
      kind: 'deterministic',
      matched: ['Finance', 'Leadership'],
    });
  });
  it('is case/whitespace-insensitive for deterministic', () => {
    const r = scoreMentor(
      { interests: [' finance '], careerGoals: [] },
      mentor({ id: 'a', careerAreas: ['Finance'] })
    );
    expect(r.kind).toBe('deterministic');
    expect(r.score).toBe(1);
  });
  it('soft: token overlap when no career-area match', () => {
    const r = scoreMentor(
      { interests: ['Something'], careerGoals: ['launch a startup'] },
      mentor({ id: 'a', careerAreas: [], expertise: 'Startup coaching and growth' })
    );
    expect(r.kind).toBe('soft');
    expect(r.score).toBeGreaterThanOrEqual(1);
  });
  it('none: no overlap at all', () => {
    const r = scoreMentor(
      { interests: ['Finance'], careerGoals: ['buy a house'] },
      mentor({ id: 'a', careerAreas: ['Healthcare'], expertise: 'nursing' })
    );
    expect(r).toEqual({ mentorId: 'a', score: 0, kind: 'none', matched: [] });
  });
  it('handles empty arrays and null expertise without crashing', () => {
    const r = scoreMentor({ interests: [], careerGoals: [] }, mentor({ id: 'a' }));
    expect(r.kind).toBe('none');
  });
});

describe('rankMentors', () => {
  it('ranks deterministic above soft above none', () => {
    const ranked = rankMentors(
      { interests: ['Finance'], careerGoals: ['startup'] },
      [
        mentor({ id: 'none', careerAreas: ['Healthcare'], expertise: 'nursing' }),
        mentor({ id: 'soft', careerAreas: [], expertise: 'startup advisor' }),
        mentor({ id: 'det', careerAreas: ['Finance'] }),
      ]
    );
    expect(ranked.map((r) => r.mentorId)).toEqual(['det', 'soft', 'none']);
  });
  it('tiebreaks equal scores by fewer active mentees', () => {
    const ranked = rankMentors(
      { interests: ['Finance'], careerGoals: [] },
      [
        mentor({ id: 'busy', careerAreas: ['Finance'], activeMenteeCount: 5 }),
        mentor({ id: 'free', careerAreas: ['Finance'], activeMenteeCount: 0 }),
      ]
    );
    expect(ranked[0].mentorId).toBe('free');
  });
});

describe('hasCapacity', () => {
  it('treats a null limit as unlimited', () => {
    expect(hasCapacity(mentor({ activeMenteeCount: 50, maxMentees: null }))).toBe(true);
  });
  it('is false once active mentees reach the limit', () => {
    expect(hasCapacity(mentor({ activeMenteeCount: 2, maxMentees: 3 }))).toBe(true);
    expect(hasCapacity(mentor({ activeMenteeCount: 3, maxMentees: 3 }))).toBe(false);
  });
});

describe('assessConfidence', () => {
  it('is high when the top mentor shares a career area', () => {
    const ranked = rankMentors({ interests: ['Finance'], careerGoals: [] }, [
      mentor({ id: 'a', careerAreas: ['Finance'] }),
    ]);
    expect(assessConfidence(ranked)).toBe('high');
  });
  it('is low when only free-text words overlap', () => {
    const ranked = rankMentors({ interests: [], careerGoals: ['startup'] }, [
      mentor({ id: 'a', expertise: 'startup advisor' }),
    ]);
    expect(assessConfidence(ranked)).toBe('low');
  });
  it('is none with no overlap or no mentors', () => {
    expect(assessConfidence([])).toBe('none');
    const ranked = rankMentors({ interests: ['Finance'], careerGoals: [] }, [
      mentor({ id: 'a', careerAreas: ['Healthcare'] }),
    ]);
    expect(assessConfidence(ranked)).toBe('none');
  });
});
