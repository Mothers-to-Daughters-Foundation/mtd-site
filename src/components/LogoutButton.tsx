'use client';

import { signOut } from 'next-auth/react';
import Button from './ui/Button';

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <Button onClick={handleLogout} variant="secondary" size="md">
      Sign Out
    </Button>
  );
}
