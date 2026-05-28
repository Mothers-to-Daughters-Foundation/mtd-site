'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import styles from './SiteHeader.module.css';
import Container from './Container';
import Button from '../ui/Button';
import { getImagePath } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user)).catch(() => {});

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Sign-out failure is non-critical; clear local state regardless
    }
    setUser(null);
    setIsMenuOpen(false);
  };

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
              src={getImagePath("/images/MDLOGO.png")}
              alt="Mothers to Daughters Logo"
              width={500}
              height={200}
              priority
              className={styles.logoImage}
              unoptimized
            />
          </Link>

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

          <nav
            className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
            aria-label="Main navigation"
          >
            <Link href="/about" className={styles.navLink} onClick={closeMenu}>
              About
            </Link>
            <Link
              href="/programs"
              className={styles.navLink}
              onClick={closeMenu}
            >
              Programs
            </Link>
            <Link href="/events" className={styles.navLink} onClick={closeMenu}>
              Events
            </Link>
            <Link href="/blog" className={styles.navLink} onClick={closeMenu}>
              Blog
            </Link>
            <Link href="/news" className={styles.navLink} onClick={closeMenu}>
              Media
            </Link>
            <Link href="/partner" className={styles.navLink} onClick={closeMenu}>
              Partner
            </Link>
            <Button
              href="/donate"
              variant="primary"
              size="md"
              className={styles.donateButton}
              onClick={closeMenu}
            >
              Donate
            </Button>
            {user ? (
              <>
                <Link href="/dashboard" className={styles.signInLink} onClick={closeMenu}>
                  <DashboardIcon className={styles.signInIcon} />
                  <span>Dashboard</span>
                </Link>
                <button className={styles.signInLink} onClick={handleSignOut}>
                  <LogoutIcon className={styles.signInIcon} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.signInLink} onClick={closeMenu}>
                <LoginIcon className={styles.signInIcon} />
                <span>Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}
