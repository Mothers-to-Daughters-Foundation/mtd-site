import { CATEGORY_KEYS, CATEGORY_WEIGHTS, type CategoryKey } from './matching';
import {
  CAREER_GOAL_OPTIONS,
  INTEREST_OPTIONS,
  MOTIVATION_OPTIONS,
  OPPORTUNITY_OPTIONS,
  SUCCESS_OPTIONS,
  optionLabel,
  type Option,
} from './onboarding-options';
import { toMatchProfile, type MatchProfileRow } from './match-profile';

export const CATEGORY_TITLES: Record<CategoryKey, string> = {
  interests: 'Interests',
  careerGoals: 'Career goals',
  motivations: 'Motivations',
  opportunityValues: 'Looking for',
  successValues: 'Success means',
};

export const CATEGORY_OPTIONS: Record<CategoryKey, Option[]> = {
  interests: INTEREST_OPTIONS,
  careerGoals: CAREER_GOAL_OPTIONS,
  motivations: MOTIVATION_OPTIONS,
  opportunityValues: OPPORTUNITY_OPTIONS,
  successValues: SUCCESS_OPTIONS,
};

export type AnswerSection = { title: string; weight: number; values: string[] };

/** A mentee's answers as readable sections for admins. */
export function describeAnswers(row: MatchProfileRow): AnswerSection[] {
  const profile = toMatchProfile(row, 'mentee');
  const sections: AnswerSection[] = CATEGORY_KEYS.map((key) => ({
    title: CATEGORY_TITLES[key],
    weight: CATEGORY_WEIGHTS[key],
    values: profile[key].map((v) => optionLabel(CATEGORY_OPTIONS[key], v)),
  }));
  if (profile.freeText.length > 0) {
    sections.push({ title: 'In their words', weight: 0, values: profile.freeText });
  }
  return sections;
}

/** Readable labels for a candidate's per-question overlap. */
export function describeBreakdown(
  breakdown: Partial<Record<CategoryKey, { overlap: number; matched: string[] }>> | undefined
) {
  return CATEGORY_KEYS.filter((key) => breakdown?.[key]).map((key) => ({
    title: CATEGORY_TITLES[key],
    overlap: breakdown![key]!.overlap,
    matched: breakdown![key]!.matched.map((v) => optionLabel(CATEGORY_OPTIONS[key], v)),
  }));
}
