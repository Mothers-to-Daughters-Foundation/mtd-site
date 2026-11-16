import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { tierKind } from '@/lib/onboarding';
import { checkAge } from '@/lib/age';
import {
  BUSINESS_EXPERIENCE_OPTIONS,
  CAREER_GOAL_OPTIONS,
  MOTIVATION_OPTIONS,
  OPPORTUNITY_OPTIONS,
  SUCCESS_OPTIONS,
  optionValues,
} from '@/lib/onboarding-options';

const choices = (options: Parameters<typeof optionValues>[0]) =>
  z.array(z.enum(optionValues(options))).max(options.length).default([]);
const otherText = z.string().trim().max(500).default('');

const schema = z
  .object({
    fullName: z.string().trim().min(1, 'Enter your name.').max(120),
    // Checked below; only the birth year is stored.
    dateOfBirth: z.string().trim(),
    // Option values plus any the mentee typed in themselves.
    interests: z
      .array(z.string().trim().min(1).max(60))
      .min(1, 'Pick at least one interest.')
      .max(40),
    motivations: choices(MOTIVATION_OPTIONS).refine((v) => v.length > 0, {
      message: 'Pick at least one reason for joining.',
    }),
    careerGoals: choices(CAREER_GOAL_OPTIONS),
    careerGoalsOther: otherText,
    successValues: choices(SUCCESS_OPTIONS),
    successOther: otherText,
    opportunityValues: choices(OPPORTUNITY_OPTIONS),
    opportunityOther: otherText,
    businessExperience: z.enum(BUSINESS_EXPERIENCE_OPTIONS, {
      error: 'Select your years of business experience.',
    }),
    aboutMe: z.string().trim().max(2000).default(''),
    planId: z.string().uuid('Choose a plan.'),
  })
  .refine((b) => b.careerGoals.length > 0 || b.careerGoalsOther, {
    message: 'Pick at least one career goal or describe your own.',
  })
  .refine((b) => b.successValues.length > 0 || b.successOther, {
    message: 'Pick at least one answer about success or describe your own.',
  })
  .refine((b) => b.opportunityValues.length > 0 || b.opportunityOther, {
    message: 'Pick at least one thing you look for or describe your own.',
  });

const orNull = (s: string) => s || null;

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

  const age = checkAge(body.dateOfBirth);
  if (!age.ok) {
    return NextResponse.json(
      { error: age.message, reason: age.reason },
      { status: age.reason === 'too_young' ? 403 : 400 }
    );
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
      birth_year: age.birthYear,
      age_confirmed_at: new Date().toISOString(),
      interests: body.interests,
      motivations: body.motivations,
      career_goals: body.careerGoals,
      career_goals_other: orNull(body.careerGoalsOther),
      success_values: body.successValues,
      success_other: orNull(body.successOther),
      opportunity_values: body.opportunityValues,
      opportunity_other: orNull(body.opportunityOther),
      business_experience: body.businessExperience,
      about_me: orNull(body.aboutMe),
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
