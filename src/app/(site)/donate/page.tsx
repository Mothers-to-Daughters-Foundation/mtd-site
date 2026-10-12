import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { zeffyPaymentUrl } from '@/lib/zeffy';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support our mission by making a donation.',
};

export default function DonatePage() {
  const zeffyUrl = zeffyPaymentUrl();

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
          <Button
            href={zeffyUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="lg"
          >
            Donate on Zeffy
          </Button>
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
