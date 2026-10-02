import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import ContactForm from '@/components/forms/ContactForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Mothers to Daughters.',
};

export default function ContactPage() {
  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.header}>
          <h1>Contact Us</h1>
          <p className={styles.intro}>
            Have any questions or need help in any way? Kindly send a message or
            give us a call—we&apos;d love to hear from you.
          </p>
        </div>

        <div className={styles.twoColumn}>
          <div className={styles.contactInfo}>
            <div className={styles.infoBlock}>
              <h2>Get in Touch</h2>
              <p>
                Whether you&apos;re interested in becoming a mentor, joining as a
                mentee, partnering with us, or simply want to learn more, we&apos;re
                here to help.
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h3>Email</h3>
              <p>
                <a href="mailto:connect@motherstodaughters.org">
                  connect@motherstodaughters.org
                </a>
                <br />
                <a href="mailto:francine@motherstodaughters.org">
                  francine@motherstodaughters.org
                </a>
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h3>Phone</h3>
              <p>
                <a href="tel:+16463026676">+1 (646) 302-6676</a>
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h3>Mailing Address</h3>
              <p>
                Mothers to Daughters
                <br />
                1001 6th Ave
                <br />
                New York, NY 10018
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h3>Connect With Us</h3>
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
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
