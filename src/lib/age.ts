/**
 * Minimum age to join. Public so the onboarding screen can explain it; the
 * server enforces it again. Change with NEXT_PUBLIC_MIN_MEMBER_AGE.
 */
export const MIN_MEMBER_AGE = (() => {
  const value = Number(process.env.NEXT_PUBLIC_MIN_MEMBER_AGE);
  return Number.isInteger(value) && value > 0 ? value : 18;
})();

const MAX_AGE = 120;

/** Parses YYYY-MM-DD strictly (rejects e.g. 2001-02-30). */
export function parseBirthDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [y, m, d] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
    ? date
    : null;
}

/** Whole years between the birth date and `today` (UTC calendar dates). */
export function ageOn(birth: Date, today: Date): number {
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export type AgeCheck =
  | { ok: true; age: number; birthYear: number }
  | { ok: false; reason: 'invalid' | 'too_young'; message: string };

export function checkAge(value: string, today = new Date(), minAge = MIN_MEMBER_AGE): AgeCheck {
  const birth = parseBirthDate(value);
  if (!birth) return { ok: false, reason: 'invalid', message: 'Enter your date of birth.' };
  const age = ageOn(birth, today);
  if (age < 0 || age > MAX_AGE) {
    return { ok: false, reason: 'invalid', message: 'Please check your date of birth.' };
  }
  if (age < minAge) {
    return {
      ok: false,
      reason: 'too_young',
      message: `Our mentorship program is for members ${minAge} and older right now. Thank you for your interest. We'd love to hear from you when you're ${minAge}!`,
    };
  }
  return { ok: true, age, birthYear: birth.getUTCFullYear() };
}
