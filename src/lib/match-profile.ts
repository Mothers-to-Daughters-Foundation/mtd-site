import { CAREER_GOAL_OPTIONS } from './onboarding-options';
import type { MatchProfile } from './matching';

/** Profile columns matching reads, for both roles. */
export const MATCH_PROFILE_COLUMNS =
  'interests, career_areas, career_goals, motivations, success_values, opportunity_values, career_goals_other, success_other, opportunity_other, about_me, expertise, bio';

export type MatchProfileRow = {
  interests?: string[] | null;
  career_areas?: string[] | null;
  career_goals?: string[] | null;
  motivations?: string[] | null;
  success_values?: string[] | null;
  opportunity_values?: string[] | null;
  career_goals_other?: string | null;
  success_other?: string | null;
  opportunity_other?: string | null;
  about_me?: string | null;
  expertise?: string | null;
  bio?: string | null;
};

const knownGoals = new Set(CAREER_GOAL_OPTIONS.map((o) => o.value));
const text = (...values: (string | null | undefined)[]) =>
  values.filter((v): v is string => Boolean(v && v.trim()));

/**
 * Build the matching profile from a user_profiles row. Mentors keep interests in
 * career_areas. Career goals saved as free text by the old onboarding form are
 * not option values, so they count as free text (keyword overlap only).
 */
export function toMatchProfile(row: MatchProfileRow, role: 'mentee' | 'mentor'): MatchProfile {
  const goals = row.career_goals ?? [];
  return {
    interests: (role === 'mentor' ? row.career_areas : row.interests) ?? [],
    careerGoals: goals.filter((g) => knownGoals.has(g)),
    motivations: row.motivations ?? [],
    opportunityValues: row.opportunity_values ?? [],
    successValues: row.success_values ?? [],
    freeText: text(
      ...goals.filter((g) => !knownGoals.has(g)),
      row.career_goals_other,
      row.success_other,
      row.opportunity_other,
      row.about_me,
      ...(role === 'mentor' ? [row.expertise, row.bio] : [])
    ),
  };
}
