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
        <h1>Donate</h1>
        <p>Your support helps us continue our mission of connecting mentors and mentees.</p>
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
