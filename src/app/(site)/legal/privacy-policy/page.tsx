import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Mothers to Daughters.',
};

export default function PrivacyPolicyPage() {
  return (
    <Section spacing="lg">
      <Container>
        <article className={styles.content}>
          <h1>Privacy Policy</h1>
          <div className={styles.lastUpdated}>
            Last updated: [Date will be added during content migration]
          </div>
          <div className={styles.textContent}>
            <p>
              Privacy policy content will be migrated from Wix during content
              migration phase.
            </p>
            <p>
              This page will contain the full privacy policy text, including
              information about data collection, usage, storage, and user rights.
            </p>
          </div>
        </article>
      </Container>
    </Section>
  );
}
