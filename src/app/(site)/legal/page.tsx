import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Legal information and policies.',
};

export default function LegalPage() {
  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.content}>
          <h1>Legal</h1>
          <nav className={styles.legalNav}>
            <a href="/legal/privacy-policy">Privacy Policy</a>
            <a href="/legal/disclaimer">Disclaimer</a>
          </nav>
        </div>
      </Container>
    </Section>
  );
}
