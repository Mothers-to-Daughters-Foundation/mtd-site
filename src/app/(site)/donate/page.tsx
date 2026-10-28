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

const donationPlans = ['Monthly - $25', 'Quarterly - $75', 'Annually - $300', 'Custom Amount'];

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
            Mothers to Daughters is a non-profit organization recognized as
            tax-exempt under Section 501(c)(3) of the Internal Revenue Code.
            Contributions to Mothers to Daughters are tax-deductible to the
            fullest extent allowed by law.
          </p>
        </div>

        <div className={styles.plans}>
          <h2>Choose Your Donation Plan</h2>
          <ul className={styles.planList}>
            {donationPlans.map((plan) => (
              <li key={plan}>
                <Button
                  href={zeffyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="md"
                  className={styles.planButton}
                >
                  {plan}
                </Button>
              </li>
            ))}
          </ul>
          <Button
            href={zeffyUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="lg"
          >
            Donate
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
