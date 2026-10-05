import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { tierKind } from '@/lib/onboarding';
import { BUSINESS_EXPERIENCE_OPTIONS } from '@/lib/onboarding-options';

const schema = z.object({
  fullName: z.string().trim().min(1, 'Enter your name.'),
  interests: z.array(z.string().trim().min(1)).min(1, 'Pick at least one interest.'),
  careerGoals: z.array(z.string().trim().min(1)).min(1, 'Add at least one career goal.'),
  businessExperience: z.enum(BUSINESS_EXPERIENCE_OPTIONS, {
    error: 'Select your years of business experience.',
  }),
  planId: z.string().uuid('Choose a plan.'),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'mentee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError ? err.issues[0].message : 'Invalid request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data: plan } = await admin
    .from('plans')
    .select('id, monthly_price, is_active')
    .eq('id', body.planId)
    .single();
  if (!plan || !plan.is_active) {
    return NextResponse.json({ error: 'Plan not found.' }, { status: 400 });
  }

  // Save profile fields + mark onboarding complete.
  const { error: updateError } = await admin
    .from('user_profiles')
    .update({
      full_name: body.fullName,
      interests: body.interests,
      career_goals: body.careerGoals,
      business_experience: body.businessExperience,
      onboarding_completed: true,
    })
    .eq('id', user.id);
  if (updateError) {
    console.error('[mentee/onboarding] profile update', updateError);
    return NextResponse.json({ error: 'Could not save your profile.' }, { status: 500 });
  }

  // Sync the name into auth metadata too, so the dashboard sidebar (which reads
  // user_metadata) shows the real name instead of the "User" fallback.
  const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { full_name: body.fullName },
  });
  if (metaError) {
    console.error('[mentee/onboarding] auth metadata update', metaError);
  }

  if (tierKind(plan.monthly_price) === 'free') {
    // Activate the Free plan immediately.
    await admin
      .from('subscriptions')
      .update({ is_current: false })
      .eq('user_id', user.id)
      .eq('is_current', true);
    await admin.from('subscriptions').insert({
      user_id: user.id,
      plan_id: plan.id,
      status: 'active',
      billing_cycle: 'monthly',
      started_at: new Date().toISOString(),
      is_current: true,
      auto_renew: true,
    });
    return NextResponse.json({ redirect: '/dashboard/mentee' });
  }

  // Paid: onboarding is already complete; the client runs checkout next.
  return NextResponse.json({ next: 'checkout', planId: plan.id });
}
