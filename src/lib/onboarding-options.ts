/**
 * Shared vocabulary for mentee onboarding and mentor profiles.
 *
 * Every matching question has the same stored `value`s on both sides; only the
 * wording differs (`label` for mentees, `mentorLabel` for mentors). That 1:1
 * mapping is what lets matching compare answers directly. Never change a
 * `value` once people have answered with it: add a new option instead.
 */

export type Option = {
  value: string;
  emoji: string;
  /** Mentee-facing wording. */
  label: string;
  /** Mentor-facing wording of the same option. */
  mentorLabel: string;
};

const same = (value: string, emoji: string): Option => ({
  value,
  emoji,
  label: value,
  mentorLabel: value,
});

/** Interests (mentees) and career areas (mentors). Values are the original labels. */
export const INTEREST_OPTIONS: Option[] = [
  same('Entrepreneurship', '🚀'),
  same('Leadership', '🧭'),
  same('Technology & STEM', '💻'),
  same('Finance', '💰'),
  same('Marketing & Branding', '📣'),
  same('Healthcare', '🩺'),
  same('Education', '📚'),
  same('Creative Arts', '🎨'),
  same('Nonprofit & Social Impact', '🤝'),
  same('Career Transition', '🔄'),
  same('Public Speaking', '🎤'),
  same('Work–Life Balance', '⚖️'),
  same('Real Estate', '🏡'),
  same('Law & Policy', '🧑‍⚖️'),
  same('Wellness & Self-Care', '🌿'),
  same('Fashion & Beauty', '👗'),
  same('Food & Hospitality', '🍽️'),
  same('Media & Communications', '📰'),
  same('Personal Finance & Wealth', '📈'),
  same('Sales & Business Development', '🤑'),
  same('Operations & Project Management', '🗂️'),
  same('Human Resources & People', '🧑‍🤝‍🧑'),
  same('Science & Research', '🔬'),
  same('Parenting & Family', '👩‍👧'),
];

/** Kept for existing callers: the plain interest values. */
export const INTEREST_CATEGORIES = INTEREST_OPTIONS.map((o) => o.value) as [string, ...string[]];

export const MOTIVATION_OPTIONS: Option[] = [
  {
    value: 'community',
    emoji: '🫶',
    label: 'Being part of a community',
    mentorLabel: 'Building a supportive community',
  },
  {
    value: 'learn_from_leaders',
    emoji: '🏛️',
    label: 'Learning from established business leaders',
    mentorLabel: 'Sharing what I learned as a business leader',
  },
  {
    value: 'career_direction',
    emoji: '🧭',
    label: 'Figuring out my next career move',
    mentorLabel: 'Helping people figure out their next career move',
  },
  {
    value: 'confidence',
    emoji: '💪',
    label: 'Building confidence and my personal brand',
    mentorLabel: 'Helping people build confidence and a personal brand',
  },
  {
    value: 'business_growth',
    emoji: '🌱',
    label: 'Starting or growing a business',
    mentorLabel: 'Helping people start or grow a business',
  },
  {
    value: 'network',
    emoji: '🔗',
    label: 'Expanding my professional network',
    mentorLabel: 'Opening doors through my professional network',
  },
  {
    value: 'accountability',
    emoji: '✅',
    label: 'Having someone keep me accountable',
    mentorLabel: 'Keeping mentees accountable to their goals',
  },
];

export const CAREER_GOAL_OPTIONS: Option[] = [
  {
    value: 'leadership_role',
    emoji: '🧑‍💼',
    label: 'Step into a leadership role',
    mentorLabel: 'Stepping into a leadership role',
  },
  {
    value: 'promotion',
    emoji: '📈',
    label: 'Get promoted where I am',
    mentorLabel: 'Getting promoted',
  },
  {
    value: 'change_careers',
    emoji: '🔄',
    label: 'Change careers or industries',
    mentorLabel: 'Changing careers or industries',
  },
  {
    value: 'start_business',
    emoji: '🚀',
    label: 'Start my own business',
    mentorLabel: 'Starting a business',
  },
  {
    value: 'grow_business',
    emoji: '🏗️',
    label: 'Grow my existing business',
    mentorLabel: 'Growing an existing business',
  },
  {
    value: 'first_job',
    emoji: '🎓',
    label: 'Land my first job or internship',
    mentorLabel: 'Landing a first job or internship',
  },
  {
    value: 'increase_income',
    emoji: '💵',
    label: 'Increase my income',
    mentorLabel: 'Negotiating pay and increasing income',
  },
  {
    value: 'return_to_work',
    emoji: '🔁',
    label: 'Return to work after a break',
    mentorLabel: 'Returning to work after a break',
  },
  {
    value: 'build_skills',
    emoji: '🛠️',
    label: 'Build a specific skill',
    mentorLabel: 'Building specific professional skills',
  },
  {
    value: 'education',
    emoji: '📜',
    label: 'Go back to school or earn a certification',
    mentorLabel: 'Choosing further education or certifications',
  },
];

export const SUCCESS_OPTIONS: Option[] = [
  {
    value: 'financial_freedom',
    emoji: '💰',
    label: 'Financial independence',
    mentorLabel: 'Financial independence',
  },
  {
    value: 'impact',
    emoji: '🌍',
    label: 'Making a difference in my community',
    mentorLabel: 'Making a difference in my community',
  },
  {
    value: 'recognition',
    emoji: '🏆',
    label: 'Being recognized as a leader in my field',
    mentorLabel: 'Being recognized as a leader in my field',
  },
  {
    value: 'balance',
    emoji: '⚖️',
    label: 'Time and flexibility for the people I love',
    mentorLabel: 'Time and flexibility for the people I love',
  },
  {
    value: 'fulfillment',
    emoji: '✨',
    label: 'Doing work that feels meaningful',
    mentorLabel: 'Doing work that feels meaningful',
  },
  {
    value: 'security',
    emoji: '🛡️',
    label: 'Stability and security',
    mentorLabel: 'Stability and security',
  },
  {
    value: 'legacy',
    emoji: '🌳',
    label: 'Building something that lasts',
    mentorLabel: 'Building something that lasts',
  },
];

export const OPPORTUNITY_OPTIONS: Option[] = [
  {
    value: 'growth',
    emoji: '🪜',
    label: 'Room to grow and advance',
    mentorLabel: 'Finding room to grow and advance',
  },
  { value: 'pay', emoji: '💵', label: 'Competitive pay', mentorLabel: 'Negotiating competitive pay' },
  {
    value: 'flexibility',
    emoji: '🏠',
    label: 'Flexible or remote work',
    mentorLabel: 'Finding flexible or remote work',
  },
  {
    value: 'mission',
    emoji: '🎯',
    label: 'A mission I believe in',
    mentorLabel: 'Finding mission-driven work',
  },
  {
    value: 'leadership',
    emoji: '🤲',
    label: 'Supportive leadership',
    mentorLabel: 'Spotting supportive leadership',
  },
  {
    value: 'learning',
    emoji: '📚',
    label: 'Learning and development',
    mentorLabel: 'Making the most of learning and development',
  },
  {
    value: 'inclusion',
    emoji: '🌈',
    label: 'An inclusive culture',
    mentorLabel: 'Evaluating inclusive cultures',
  },
  {
    value: 'balance',
    emoji: '🧘',
    label: 'Work–life balance',
    mentorLabel: 'Protecting work–life balance',
  },
  {
    value: 'autonomy',
    emoji: '🦋',
    label: 'Independence and ownership',
    mentorLabel: 'Taking on independence and ownership',
  },
  {
    value: 'stability',
    emoji: '🏦',
    label: 'Stability and benefits',
    mentorLabel: 'Weighing stability and benefits',
  },
  {
    value: 'creativity',
    emoji: '🎨',
    label: 'Creative work',
    mentorLabel: 'Finding creative work',
  },
  {
    value: 'impact',
    emoji: '🌍',
    label: 'Visible impact',
    mentorLabel: 'Finding roles with visible impact',
  },
];

export const BUSINESS_EXPERIENCE_OPTIONS = [
  '0–1 years',
  '2–5 years',
  '6–10 years',
  '11+ years',
] as const;

export const optionValues = (options: Option[]) =>
  options.map((o) => o.value) as [string, ...string[]];

/** Display text for a stored value; falls back to the raw value for free text and retired options. */
export function optionLabel(options: Option[], value: string, side: 'mentee' | 'mentor' = 'mentee') {
  const option = options.find((o) => o.value === value);
  if (!option) return value;
  return `${option.emoji} ${side === 'mentor' ? option.mentorLabel : option.label}`;
}
