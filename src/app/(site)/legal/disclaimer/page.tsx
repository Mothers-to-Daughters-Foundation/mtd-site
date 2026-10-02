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
          <div className={styles.lastUpdated}>Last updated: October 2, 2026</div>
          <div className={styles.textContent}>
            <p>
              The information provided by Mothers to Daughters (&ldquo;M2D&rdquo;)
              on this website is for general informational and educational
              purposes only. All content is provided in good faith; however, we
              make no representation or warranty of any kind regarding its
              accuracy, adequacy, validity, reliability, or completeness.
            </p>

            <h2>Not Professional Advice</h2>
            <p>
              Our programs, mentorship, workshops, and content are intended to
              support personal and professional growth. They are not a substitute
              for professional legal, financial, medical, or career advice. You
              should consult a qualified professional before making decisions
              based on information found here.
            </p>

            <h2>External Links</h2>
            <p>
              This website may contain links to third-party websites or content.
              We do not warrant, endorse, or assume responsibility for the
              accuracy or reliability of any information offered by third-party
              sites linked through this website.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              Under no circumstances shall Mothers to Daughters be liable for any
              loss or damage of any kind incurred as a result of the use of this
              website or reliance on any information provided. Your use of the
              site and your reliance on any information is solely at your own
              risk.
            </p>

            <h2>Contact Us</h2>
            <p>
              Questions about this disclaimer? Email us at{' '}
              <a href="mailto:connect@motherstodaughters.org">
                connect@motherstodaughters.org
              </a>
              .
            </p>
          </div>
        </article>
      </Container>
    </Section>
  );
}
