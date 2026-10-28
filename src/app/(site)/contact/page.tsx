import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import ContactForm from '@/components/forms/ContactForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Have any question or need help in anyway? Kindly send a message or call Mothers to Daughters.',
};

export default function ContactPage() {
  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Let&apos;s Connect</p>
          <h1>Get in Touch</h1>
          <p className={styles.intro}>
            Have any question or need help in anyway? Kindly send a message or
            call.
          </p>
        </div>

        <div className={styles.twoColumn}>
          <div className={styles.contactInfo}>
            <div className={styles.infoBlock}>
              <h2>Address</h2>
              <p>1001 6th Ave, New York, NY 10018</p>
            </div>

            <div className={styles.infoBlock}>
              <h2>Email</h2>
              <p>
                <a href="mailto:francine@motherstodaughters.org">
                  francine@motherstodaughters.org
                </a>
                <br />
                <a href="mailto:connect@motherstodaughters.org">
                  connect@motherstodaughters.org
                </a>
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h2>Phone</h2>
              <p>
                <a href="tel:+16463026676">+1 (646) 302-6676</a>
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h2>Social Media</h2>
              <div className={styles.socialLinks}>
                <a
                  href="https://www.instagram.com/mothers_to_daughters/"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
                <a
                  href="https://www.linkedin.com/company/mothers2daughters/"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  LinkedIn
                </a>
                <a
                  href="https://www.facebook.com/103109278024073"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  Facebook
                </a>
                <a
                  href="https://www.tiktok.com/@mothers2daughters_"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  TikTok
                </a>
                <a
                  href="https://www.youtube.com/channel/UCG7gLfQjkEDGuE7SSwiLU6A"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>

          <div className={styles.formContainer}>
            <ContactForm submitLabel="Send" successMessage="Thanks for submitting!" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
