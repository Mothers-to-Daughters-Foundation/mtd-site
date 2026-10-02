import Link from 'next/link';
import styles from './SiteFooter.module.css';
import Container from './Container';
import NewsletterFormInline from '../forms/NewsletterFormInline';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.content}>
          {/* Column 1: About + Mission */}
          <div className={styles.section}>
            <h3 className={styles.heading}>About</h3>
            <p className={styles.mission}>
              A global movement dedicated to forging deep connections,
              amplifying voices, and driving meaningful action—empowering women
              to thrive across generations.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className={styles.section}>
            <h3 className={styles.heading}>Navigation</h3>
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
              <Link href="/team" className={styles.link}>
                Our Team
              </Link>
              <Link href="/donate" className={styles.link}>
                Donate
              </Link>
              <Link href="/volunteer" className={styles.link}>
                Volunteer
              </Link>
              <Link href="/partner" className={styles.link}>
                Partner
              </Link>
              <Link href="/courses" className={styles.link}>
                Courses
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact + Social */}
          <div className={styles.section}>
            <h3 className={styles.heading}>Contact</h3>
            <div className={styles.contactInfo}>
              <Link href="/contact" className={styles.link}>
                Get in Touch
              </Link>
              <a href="mailto:connect@motherstodaughters.org" className={styles.link}>
                connect@motherstodaughters.org
              </a>
              <a href="tel:+16463026676" className={styles.link}>
                +1 (646) 302-6676
              </a>
            </div>
            <div className={styles.social}>
              <a
                href="https://www.instagram.com/mothers_to_daughters/"
                className={styles.socialLink}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                href="https://www.linkedin.com/company/mothers2daughters/"
                className={styles.socialLink}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="https://www.facebook.com/103109278024073"
                className={styles.socialLink}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@mothers2daughters_"
                className={styles.socialLink}
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok
              </a>
              <a
                href="https://www.youtube.com/channel/UCG7gLfQjkEDGuE7SSwiLU6A"
                className={styles.socialLink}
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube
              </a>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className={styles.section}>
            <h3 className={styles.heading}>Newsletter</h3>
            <p className={styles.newsletterDescription}>
              Stay connected with updates on programs, events, and stories from
              our community.
            </p>
            <NewsletterFormInline />
          </div>
        </div>

        {/* Legal Links - Bottom Most */}
        <div className={styles.legal}>
          <nav className={styles.legalNav} aria-label="Legal links">
            <Link href="/legal" className={styles.legalLink}>
              Legal
            </Link>
            <Link href="/legal/privacy-policy" className={styles.legalLink}>
              Privacy Policy
            </Link>
            <Link href="/legal/disclaimer" className={styles.legalLink}>
              Disclaimer
            </Link>
          </nav>
        </div>

        <div className={styles.copyright}>
          <p>
            &copy; {currentYear} Mothers to Daughters. A registered 501(c)(3)
            nonprofit. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
