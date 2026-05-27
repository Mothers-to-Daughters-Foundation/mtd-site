'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import styles from './DashboardSidebar.module.css';

const adminNav = [
  { href: '/dashboard/admin', label: 'Overview', exact: true },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/tiers', label: 'Subscription Tiers' },
  { href: '/dashboard/admin/matches', label: 'Matches' },
  { href: '/dashboard/admin/subscriptions', label: 'Subscriptions' },
];

const mentorNav = [
  { href: '/dashboard/mentor', label: 'Overview', exact: true },
  { href: '/dashboard/mentor/mentees', label: 'My Mentees' },
  { href: '/dashboard/mentor/profile', label: 'Profile' },
  { href: '/dashboard/mentor/resources', label: 'Resources' },
];

const menteeNav = [
  { href: '/dashboard/mentee', label: 'Overview', exact: true },
  { href: '/dashboard/mentee/subscription', label: 'Subscription' },
  { href: '/dashboard/mentee/profile', label: 'Profile' },
];

function NavItem({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
      {label}
    </Link>
  );
}

export default function DashboardSidebar() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const navItems =
    role === 'admin' ? adminNav : role === 'mentor' ? mentorNav : menteeNav;

  const roleLabel =
    role === 'admin' ? 'Admin' : role === 'mentor' ? 'Mentor' : 'Mentee';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Link href="/" className={styles.brandLink}>
          MTD
        </Link>
        <span className={styles.roleTag}>{roleLabel}</span>
      </div>

      {session?.user && (
        <div className={styles.userInfo}>
          <div className={styles.userName}>{session.user.name}</div>
          <div className={styles.userEmail}>{session.user.email}</div>
        </div>
      )}

      <nav className={styles.nav} aria-label="Dashboard navigation">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className={styles.bottom}>
        <Link href="/" className={styles.siteLink}>
          ← Back to site
        </Link>
        <button
          className={styles.signOutBtn}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
