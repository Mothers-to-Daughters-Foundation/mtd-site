import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from '../terms/page.module.css';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Disclaimer for Mothers to Daughters.',
};

// Carried over word for word from motherstodaughters.org/disclaimer.
export default function DisclaimerPage() {
  return (
    <Section spacing="lg">
      <Container>
        <article className={styles.content}>
          <h1>Disclaimer</h1>
          <div className={styles.lastUpdated}>Last updated: June 20, 2025</div>
          <div className={styles.textContent}>
            <p>
              The information provided on motherstodaughters.org is for general informational
              purposes only. While we strive to ensure the accuracy of the content, we make no
              representations or warranties regarding the completeness, reliability, or suitability
              of the information.
            </p>

            <h2>1. No Professional Advice</h2>
            <p>
              The content on this website does not constitute professional advice. Always seek the
              advice of qualified professionals regarding any questions you may have.
            </p>

            <h2>2. External Links</h2>
            <p>
              Our website may contain links to external sites. We are not responsible for the
              content or practices of these external sites.
            </p>

            <h2>3. Limitation of Liability</h2>
            <p>
              We shall not be liable for any damages arising from the use or inability to use the
              materials on this site, even if we have been notified of the possibility of such
              damages.
            </p>

            <h2>4. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Mothers to Daughters from any claims, losses,
              or damages arising out of your use of this website.
            </p>
          </div>
        </article>
      </Container>
    </Section>
  );
}
