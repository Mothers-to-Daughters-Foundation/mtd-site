'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoginIcon from '@mui/icons-material/Login';
import styles from './SiteHeader.module.css';
import Container from './Container';
import Button from '../ui/Button';
import { getImagePath } from '@/lib/utils';
import { appHref } from '@/lib/appUrl';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from './NotificationBell';

type HeaderUser = {
  name: string;
  role: 'admin' | 'mentor' | 'mentee';
  avatarUrl: string | null;
};

type NavGroup = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

// Top-level nav. Groups with children reveal a dropdown on hover (desktop) and
// render flat/expanded inside the hamburger (mobile). All routes stay reachable.
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Our Team', href: '/team' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    children: [{ label: 'Courses', href: '/courses' }],
  },
  {
    label: 'Events',
    href: '/events',
    children: [{ label: 'Mentors Mixer', href: '/mentors-mixer' }],
  },
  {
    label: 'Media',
    children: [
      { label: 'Blog', href: '/blog' },
      { label: 'News', href: '/news' },
    ],
  },
  {
    label: 'Get Involved',
    children: [
      { label: 'Partner', href: '/partner' },
      { label: 'Volunteer', href: '/volunteer' },
    ],
  },
];

function dashboardHref(role: HeaderUser['role']): string {
  if (role === 'admin') return appHref('/dashboard/admin');
  if (role === 'mentor') return appHref('/dashboard/mentor/profile');
  return appHref('/dashboard/mentee/profile');
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfile() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        if (active) setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, role, avatar_url')
        .eq('id', authUser.id)
        .single();

      if (!active) return;

      setUser({
        name: profile?.full_name ?? authUser.email ?? 'Account',
        role: (profile?.role as HeaderUser['role']) ?? 'mentee',
        avatarUrl: profile?.avatar_url ?? null,
      });
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.content}>
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            <Image
              src={getImagePath("/icons/m2dicon.png")}
              alt="Mothers to Daughters Logo"
              width={145}
              height={77}
              priority
              className={styles.logoImage}
              unoptimized
            />
          </Link>

          <nav
            className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
            aria-label="Main navigation"
          >
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className={styles.navItem}>
                {group.href ? (
                  <Link href={group.href} className={styles.navLink} onClick={closeMenu}>
                    {group.label}
                    {group.children && <span className={styles.caret} aria-hidden> ▾</span>}
                  </Link>
                ) : (
                  <button type="button" className={styles.dropdownTrigger} aria-haspopup="true">
                    {group.label}
                    <span className={styles.caret} aria-hidden> ▾</span>
                  </button>
                )}
                {group.children && (
                  <div className={styles.dropdown}>
                    {group.children.map((child) => (
                      <Link key={child.href} href={child.href} onClick={closeMenu}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Button
              href="/donate"
              variant="primary"
              size="md"
              className={styles.donateButton}
              onClick={closeMenu}
            >
              Donate
            </Button>
          </nav>
          <div className={styles.headerActions}>
            <button
              className={styles.menuToggle}
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className={styles.menuIcon}></span>
              <span className={styles.menuIcon}></span>
              <span className={styles.menuIcon}></span>
            </button>
            {user ? (
              <div className={styles.userControls}>
                <NotificationBell />
                <a
                  href={dashboardHref(user.role)}
                  className={styles.profileLink}
                  onClick={closeMenu}
                  aria-label={`${user.name} — go to your dashboard`}
                >
                  <span className={styles.avatar}>
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt=""
                        width={32}
                        height={32}
                        className={styles.avatarImage}
                        unoptimized
                      />
                    ) : (
                      <span className={styles.avatarInitials}>
                        {initials(user.name)}
                      </span>
                    )}
                  </span>
                  <span className={styles.profileName}>{user.name}</span>
                </a>
              </div>
            ) : (
              <Link href={appHref('/login')} className={styles.signInLink} onClick={closeMenu}>
                <LoginIcon className={styles.signInIcon} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
