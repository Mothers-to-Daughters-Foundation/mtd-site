'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoginIcon from '@mui/icons-material/Login';
import styles from './SiteHeader.module.css';
import Container from './Container';
import Button from '../ui/Button';
import { getImagePath } from '@/lib/utils';

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link href="/login" className={styles.signInLink} onClick={closeMenu}>
              <LoginIcon className={styles.signInIcon} />
              <span>Sign In</span>
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
