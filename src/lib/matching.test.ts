import { describe, it, expect } from 'vitest';
import {
  scoreMentor,
  rankMentors,
  hasCapacity,
  assessConfidence,
  keywordSet,
  type MenteeForMatch,
  type MentorForMatch,
} from './matching';

const empty = {
  interests: [],
  careerGoals: [],
  motivations: [],
  opportunityValues: [],
  successValues: [],
  freeText: [],
};

const mentee = (over: Partial<MenteeForMatch>): MenteeForMatch => ({ ...empty, ...over });
const mentor = (over: Partial<MentorForMatch>): MentorForMatch => ({
  ...empty,
  id: 'm',
  activeMenteeCount: 0,
  maxMentees: null,
  ...over,
});

const full = {
  interests: ['Finance', 'Leadership'],
  careerGoals: ['start_business'],
  motivations: ['community', 'learn_from_leaders'],
  opportunityValues: ['growth', 'mission'],
  successValues: ['impact'],
};

describe('scoreMentor', () => {
  it('scores 100% when the mentor covers every answer', () => {
    const r = scoreMentor(mentee(full), mentor({ id: 'a', ...full }));
    expect(r.score).toBe(1);
    expect(r.kind).toBe('strong');
    expect(r.completeness).toBe(1);
  });

  it('weights each question and scores the share of the mentee answers covered', () => {
    // interests 1/2 (0.3 weight), goals 1/1 (0.25); other questions skipped by the mentee
    const r = scoreMentor(
      mentee({ interests: ['Finance', 'Leadership'], careerGoals: ['start_business'] }),
      mentor({ id: 'a', interests: ['finance'], careerGoals: ['start_business'] })
    );
    expect(r.score).toBeCloseTo((0.3 * 0.5 + 0.25 * 1) / 0.55, 3);
    expect(r.breakdown.interests).toEqual({ overlap: 0.5, matched: ['finance'] });
  });

  it('weights success lightly compared with interests', () => {
    const onlySuccess = scoreMentor(
      mentee({ interests: ['Finance'], successValues: ['impact'] }),
      mentor({ successValues: ['impact'], interests: ['Healthcare'] })
    );
    const onlyInterest = scoreMentor(
      mentee({ interests: ['Finance'], successValues: ['impact'] }),
      mentor({ interests: ['Finance'], successValues: ['security'] })
    );
    expect(onlyInterest.score).toBeGreaterThan(onlySuccess.score * 2);
  });

  it('adds a small, capped bonus for shared keywords in free text', () => {
    const base = mentee({ interests: ['Finance'], freeText: ['I want to open a bakery and catering company'] });
    const plain = scoreMentor(base, mentor({ interests: ['Healthcare'] }));
    const words = scoreMentor(
      base,
      mentor({ interests: ['Healthcare'], freeText: ['Ran a bakery and catering company for 20 years'] })
    );
    expect(plain.score).toBe(0);
    expect(words.keywords).toEqual(expect.arrayContaining(['bakery', 'catering', 'company']));
    expect(words.score).toBeGreaterThan(0);
    expect(words.score).toBeLessThanOrEqual(0.05);
  });

  it('lowers completeness when the mentor skipped questions', () => {
    const r = scoreMentor(mentee(full), mentor({ interests: full.interests }));
    expect(r.completeness).toBeCloseTo(0.3, 3);
  });

  it('handles an empty mentee without crashing', () => {
    const r = scoreMentor(mentee({}), mentor({ ...full }));
    expect(r).toMatchObject({ score: 0, kind: 'none' });
  });
});

describe('rankMentors', () => {
  it('orders by score, then fewer active mentees', () => {
    const ranked = rankMentors(mentee(full), [
      mentor({ id: 'weak', interests: ['Finance'] }),
      mentor({ id: 'busy', ...full, activeMenteeCount: 3 }),
      mentor({ id: 'free', ...full, activeMenteeCount: 1 }),
    ]);
    expect(ranked.map((r) => r.mentorId)).toEqual(['free', 'busy', 'weak']);
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
  it('is high for a strong, complete, clear winner', () => {
    const ranked = rankMentors(mentee(full), [
      mentor({ id: 'a', ...full }),
      mentor({ id: 'b', interests: ['Finance'] }),
    ]);
    expect(assessConfidence(ranked)).toMatchObject({ level: 'high', reasons: [] });
  });

  it('is low when two mentors are almost tied', () => {
    const ranked = rankMentors(mentee(full), [mentor({ id: 'a', ...full }), mentor({ id: 'b', ...full })]);
    const c = assessConfidence(ranked);
    expect(c.level).toBe('low');
    expect(c.reasons.join(' ')).toMatch(/almost equally/);
  });

  it('is low when the mentor profile is too thin to be sure', () => {
    const ranked = rankMentors(mentee({ interests: ['Finance'] }), [
      mentor({ id: 'a', interests: ['Finance'] }),
    ]);
    const c = assessConfidence(ranked);
    expect(c.score).toBe(1);
    expect(c.level).toBe('low');
  });

  it('is none with no overlap or no mentors', () => {
    expect(assessConfidence([]).level).toBe('none');
    const ranked = rankMentors(mentee({ interests: ['Finance'] }), [
      mentor({ id: 'a', interests: ['Healthcare'] }),
    ]);
    expect(assessConfidence(ranked).level).toBe('none');
  });
});

describe('keywordSet', () => {
  it('drops short words and stopwords', () => {
    expect([...keywordSet(['I want to grow my Bakery, and help others'])]).toEqual(['grow', 'bakery', 'others']);
  });
});
