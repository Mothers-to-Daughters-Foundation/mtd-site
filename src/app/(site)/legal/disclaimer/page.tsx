import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Disclaimer for Mothers to Daughters.',
};

export default function DisclaimerPage() {
  return (
    <Section spacing="lg">
      <Container>
        <article className={styles.content}>
          <h1>Disclaimer</h1>
          <div className={styles.lastUpdated}>
            Last updated: [Date will be added during content migration]
          </div>
          <div className={styles.textContent}>
            <p>
              Disclaimer content will be migrated from Wix during content
              migration phase.
            </p>
            <p>
              This page will contain the full disclaimer text, including
              limitations of liability, accuracy of information, and other legal
              disclaimers.
            </p>
          </div>
        </article>
      </Container>
    </Section>
  );
}
