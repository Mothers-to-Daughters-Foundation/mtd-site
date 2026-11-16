'use client';

import {
  CAREER_GOAL_OPTIONS,
  INTEREST_OPTIONS,
  MOTIVATION_OPTIONS,
  OPPORTUNITY_OPTIONS,
  SUCCESS_OPTIONS,
  type Option,
} from '@/lib/onboarding-options';
import styles from './MatchProfileFields.module.css';

export type MentorMatchAnswers = {
  careerAreas: string[];
  motivations: string[];
  careerGoals: string[];
  successValues: string[];
  opportunityValues: string[];
};

export const EMPTY_MENTOR_ANSWERS: MentorMatchAnswers = {
  careerAreas: [],
  motivations: [],
  careerGoals: [],
  successValues: [],
  opportunityValues: [],
};

/**
 * The mentor side of the matching questions. Same options as mentee onboarding,
 * worded for mentors, so the two can be compared answer for answer.
 */
const SECTIONS: {
  key: keyof MentorMatchAnswers;
  title: string;
  help: string;
  weight: number;
  options: Option[];
}[] = [
  {
    key: 'careerAreas',
    title: 'Which areas can they mentor in?',
    help: 'Matched against mentee interests.',
    weight: 30,
    options: INTEREST_OPTIONS,
  },
  {
    key: 'careerGoals',
    title: 'Which career goals can they help with?',
    help: 'Matched against mentee career goals.',
    weight: 25,
    options: CAREER_GOAL_OPTIONS,
  },
  {
    key: 'motivations',
    title: 'Why do they mentor, and what do they bring?',
    help: 'Matched against why mentees joined.',
    weight: 20,
    options: MOTIVATION_OPTIONS,
  },
  {
    key: 'opportunityValues',
    title: 'What can they advise on when choosing an opportunity?',
    help: 'Matched against what mentees look for next.',
    weight: 15,
    options: OPPORTUNITY_OPTIONS,
  },
  {
    key: 'successValues',
    title: 'What does success mean to them?',
    help: 'Matched against mentees’ answers, lightly weighted.',
    weight: 10,
    options: SUCCESS_OPTIONS,
  },
];

export function answeredSections(value: MentorMatchAnswers) {
  return SECTIONS.filter((s) => value[s.key].length > 0).length;
}

export default function MatchProfileFields({
  value,
  onChange,
  voice = 'they',
}: {
  value: MentorMatchAnswers;
  onChange: (next: MentorMatchAnswers) => void;
  /** "they" for admins setting up a mentor, "you" for the mentor's own profile. */
  voice?: 'they' | 'you';
}) {
  const toggle = (key: keyof MentorMatchAnswers, option: string) => {
    const current = value[key];
    onChange({
      ...value,
      [key]: current.includes(option) ? current.filter((v) => v !== option) : [...current, option],
    });
  };

  const answered = answeredSections(value);

  return (
    <div className={styles.wrap}>
      <p className={answered === SECTIONS.length ? styles.complete : styles.progress}>
        {answered} of {SECTIONS.length} matching sections answered.{' '}
        {answered < SECTIONS.length &&
          'Answer every section so mentees can be matched automatically instead of waiting for review.'}
      </p>
      {SECTIONS.map((section) => (
        <fieldset key={section.key} className={styles.section}>
          <legend className={styles.legend}>
            {voice === 'you'
              ? section.title
                  .replace('can they', 'can you')
                  .replace('do they', 'do you')
                  .replace('to them', 'to you')
              : section.title}{' '}
            <span className={styles.weight}>{section.weight}%</span>
          </legend>
          <p className={styles.help}>{section.help}</p>
          <div className={styles.chips}>
            {section.options.map((o) => {
              const on = value[section.key].includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => toggle(section.key, o.value)}
                  aria-pressed={on}
                  className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                >
                  <span aria-hidden="true">{o.emoji}</span> {o.mentorLabel}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
