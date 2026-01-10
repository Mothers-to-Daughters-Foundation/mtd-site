'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './SiteHeader.module.css';
import Container from './Container';
import Button from '../ui/Button';

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
            MTD
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
            <Link href="/news" className={styles.navLink} onClick={closeMenu}>
              News
            </Link>
            <Link href="/events" className={styles.navLink} onClick={closeMenu}>
              Events
            </Link>
            <Link href="/blog" className={styles.navLink} onClick={closeMenu}>
              Blog
            </Link>
            <Link
              href="/mentors-mixer"
              className={styles.navLink}
              onClick={closeMenu}
            >
              Mentors Mixer
            </Link>
            <Link href="/partner" className={styles.navLink} onClick={closeMenu}>
              Become a Partner
            </Link>
            <Link href="/courses" className={styles.navLink} onClick={closeMenu}>
              Courses
            </Link>
            <Button
              href="/donate"
              variant="primary"
              size="sm"
              className={styles.donateButton}
              onClick={closeMenu}
            >
              Donate
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  );
}
