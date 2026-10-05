import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingForm from './OnboardingForm';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Welcome | Set up your profile' };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'mentee' || profile.onboarding_completed) {
    redirect('/dashboard');
  }

  return <OnboardingForm />;
}
