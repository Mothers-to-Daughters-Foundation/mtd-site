import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support our mission by making a donation.',
};

export default function DonatePage() {
  const zeffyUrl = process.env.NEXT_PUBLIC_ZEFFY_URL || 'https://zeffy.com';

  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.intro}>
          <h1>Donate</h1>
          <p>
            She could be your daughter. Your sister. Your future leader. Your
            gift fuels free, high-impact mentorship that equips young women with
            the confidence, skills, and community they need to thrive—and to lift
            up the next generation after them.
          </p>
          <p className={styles.taxNote}>
            Mothers to Daughters is a registered 501(c)(3) nonprofit. Every
            contribution, big or small, makes a difference.
          </p>
        </div>
        <div className={styles.zeffyContainer}>
          <iframe
            src={zeffyUrl}
            title="Zeffy Donation Form"
            className={styles.zeffyIframe}
            allow="payment"
            loading="lazy"
          />
        </div>
      </Container>
    </Section>
  );
}
