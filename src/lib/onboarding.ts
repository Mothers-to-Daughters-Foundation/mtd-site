/** True only when a mentee has not yet completed onboarding. */
export function needsOnboarding(
  role: string,
  onboardingCompleted: boolean
): boolean {
  return role === 'mentee' && onboardingCompleted === false;
}

/** Whether a plan's price makes it a free or paid tier. */
export function tierKind(
  monthlyPrice: number | string | null | undefined
): 'free' | 'paid' {
  return Number(monthlyPrice ?? 0) > 0 ? 'paid' : 'free';
}
