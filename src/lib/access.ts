import { createAdminClient } from './supabase/admin';
import { evaluateMenteeAccess, type MenteeAccess } from './access-rule';

/**
 * Fetch the user's role + current subscription + plan and evaluate paid
 * access. Uses the service role for reliable reads. Fail-closed: any error
 * denies access (data itself stays protected by RLS regardless).
 */
export async function getMenteeAccess(userId: string): Promise<MenteeAccess> {
  try {
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const role = profile?.role ?? 'mentee';
    if (role === 'mentor' || role === 'admin') {
      return { hasAccess: true, reason: 'ok' };
    }

    const { data: sub } = await admin
      .from('subscriptions')
      .select('status, expires_at, plan_id')
      .eq('user_id', userId)
      .eq('is_current', true)
      .maybeSingle();

    let plan: { monthly_price: number | string } | null = null;
    if (sub?.plan_id) {
      const { data: p } = await admin
        .from('plans')
        .select('monthly_price')
        .eq('id', sub.plan_id)
        .single();
      plan = p ?? null;
    }

    return evaluateMenteeAccess(role, sub ?? null, plan, new Date());
  } catch (error) {
    console.error('[getMenteeAccess]', error);
    return { hasAccess: false, reason: 'no_subscription' };
  }
}
