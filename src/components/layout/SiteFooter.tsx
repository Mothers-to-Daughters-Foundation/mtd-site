import Link from 'next/link';
import styles from './SiteFooter.module.css';
import Container from './Container';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.heading}>Quick Links</h3>
            <nav className={styles.nav} aria-label="Footer navigation">
              <Link href="/about" className={styles.link}>
                About
              </Link>
              <Link href="/team" className={styles.link}>
                Our Team
              </Link>
              <Link href="/programs" className={styles.link}>
                Programs
              </Link>
              <Link href="/news" className={styles.link}>
                News
              </Link>
              <Link href="/events" className={styles.link}>
                Events
              </Link>
              <Link href="/blog" className={styles.link}>
                Blog
              </Link>
              <Link href="/contact" className={styles.link}>
                Contact
              </Link>
            </nav>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>Get Involved</h3>
            <nav className={styles.nav} aria-label="Get involved links">
              <Link href="/donate" className={styles.link}>
                Donate
              </Link>
              <Link href="/volunteer" className={styles.link}>
                Volunteer
              </Link>
              <Link href="/partner" className={styles.link}>
                Become a Partner
              </Link>
              <Link href="/courses" className={styles.link}>
                Courses
              </Link>
            </nav>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>Connect</h3>
            <div className={styles.social}>
              <a
                href="#"
                className={styles.socialLink}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                href="#"
                className={styles.socialLink}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className={styles.socialLink}
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok
              </a>
              <a
                href="#"
                className={styles.socialLink}
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube
              </a>
            </div>
          </div>
          <div className={styles.section}>
            <h3 className={styles.heading}>Legal</h3>
            <nav className={styles.nav} aria-label="Legal links">
              <Link href="/legal" className={styles.link}>
                Legal
              </Link>
              <Link href="/legal/privacy-policy" className={styles.link}>
                Privacy Policy
              </Link>
              <Link href="/legal/disclaimer" className={styles.link}>
                Disclaimer
              </Link>
            </nav>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {currentYear} MTD. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
