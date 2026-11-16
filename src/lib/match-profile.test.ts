import { describe, it, expect } from 'vitest';
import { toMatchProfile } from './match-profile';

describe('toMatchProfile', () => {
  it('reads mentee answers and keeps free text for keyword matching', () => {
    const p = toMatchProfile(
      {
        interests: ['Finance'],
        career_goals: ['start_business', 'Open a bakery'], // second is from the old free-text form
        motivations: ['community'],
        career_goals_other: 'Catering too',
        about_me: 'Mom of two',
      },
      'mentee'
    );
    expect(p.interests).toEqual(['Finance']);
    expect(p.careerGoals).toEqual(['start_business']);
    expect(p.freeText).toEqual(['Open a bakery', 'Catering too', 'Mom of two']);
  });

  it('uses career areas, expertise and bio for mentors', () => {
    const p = toMatchProfile(
      { career_areas: ['Leadership'], interests: ['ignored'], expertise: 'Retail', bio: 'Ran stores' },
      'mentor'
    );
    expect(p.interests).toEqual(['Leadership']);
    expect(p.freeText).toEqual(['Retail', 'Ran stores']);
  });

  it('treats missing columns as empty', () => {
    expect(toMatchProfile({}, 'mentee')).toMatchObject({ interests: [], motivations: [], freeText: [] });
  });
});
