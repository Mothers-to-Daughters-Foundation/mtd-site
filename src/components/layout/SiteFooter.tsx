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
              <Link href="/programs" className={styles.link}>
                Programs
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
                Partner
              </Link>
            </nav>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>Connect</h3>
            <div className={styles.social}>
              {/* Add social media links as needed */}
              <a
                href="#"
                className={styles.socialLink}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                href="#"
                className={styles.socialLink}
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
              <a
                href="#"
                className={styles.socialLink}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {currentYear} MTD. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
