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
            We&apos;d love to hear from you. Reach out with questions, ideas, or
            to learn more about how you can get involved.
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
              <h3>Mailing Address</h3>
              <p>
                Mothers to Daughters
                <br />
                [Address will be added during content migration]
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h3>Connect With Us</h3>
              <div className={styles.socialLinks}>
                <a
                  href="#"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  LinkedIn
                </a>
                <a
                  href="#"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  TikTok
                </a>
                <a
                  href="#"
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
