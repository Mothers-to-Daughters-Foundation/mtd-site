export type MenteeAccessReason =
  | 'ok'
  | 'no_subscription'
  | 'free_tier'
  | 'expired'
  | 'cancelled'
  | 'paused';

export type MenteeAccess = { hasAccess: boolean; reason: MenteeAccessReason };

export type AccessSubscription = {
  status: string;
  expires_at: string | null;
} | null;

export type AccessPlan = { monthly_price: number | string } | null;

/**
 * Decide whether a user may use the paid-gated features (mentor chat,
 * resources, sessions). Pure — no I/O. See the design spec for the rule.
 */
export function evaluateMenteeAccess(
  role: string,
  subscription: AccessSubscription,
  plan: AccessPlan,
  now: Date
): MenteeAccess {
  if (role === 'mentor' || role === 'admin') {
    return { hasAccess: true, reason: 'ok' };
  }
  if (!subscription) {
    return { hasAccess: false, reason: 'no_subscription' };
  }
  if (subscription.status === 'cancelled') {
    return { hasAccess: false, reason: 'cancelled' };
  }
  if (subscription.status === 'paused') {
    return { hasAccess: false, reason: 'paused' };
  }
  if (subscription.status === 'expired') {
    return { hasAccess: false, reason: 'expired' };
  }
  if (
    subscription.expires_at &&
    new Date(subscription.expires_at).getTime() <= now.getTime()
  ) {
    return { hasAccess: false, reason: 'expired' };
  }
  const price = Number(plan?.monthly_price ?? 0);
  if (!(price > 0)) {
    return { hasAccess: false, reason: 'free_tier' };
  }
  if (subscription.status === 'active' || subscription.status === 'trial') {
    return { hasAccess: true, reason: 'ok' };
  }
  return { hasAccess: false, reason: 'expired' };
}
