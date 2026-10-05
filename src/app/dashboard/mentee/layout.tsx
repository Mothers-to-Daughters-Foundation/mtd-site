import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { needsOnboarding } from '@/lib/onboarding';

export const dynamic = 'force-dynamic';

export default async function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Fail-safe: only redirect on a definitive not-completed mentee.
  if (profile && needsOnboarding(profile.role, profile.onboarding_completed === true)) {
    redirect('/dashboard/onboarding');
  }

  return <>{children}</>;
}
