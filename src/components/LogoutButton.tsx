'use client';

import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

import Button from './ui/Button';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push('/login');

    router.refresh();
  };

  return (
    <Button
      onClick={handleLogout}
      variant="secondary"
      size="md"
    >
      Sign Out
    </Button>
  );
}