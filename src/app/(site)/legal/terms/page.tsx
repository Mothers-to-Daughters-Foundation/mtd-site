import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of Use for Mothers to Daughters.',
};

export default function TermsOfUsePage() {
  return (
    <Section spacing="lg">
      <Container>
        <article className={styles.content}>
          <h1>Terms of Use</h1>
          <div className={styles.lastUpdated}>Last updated: June 20, 2025</div>
          <div className={styles.textContent}>
            <p>
              By accessing or using motherstodaughters.org, you agree to comply
              with and be bound by the following Terms of Use.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By using our website, you agree to these Terms of Use. If you do
              not agree, please refrain from using our site.
            </p>

            <h2>2. Use of Site</h2>
            <p>
              You agree to use this site only for lawful purposes and in
              accordance with these Terms.
            </p>

            <h2>3. Intellectual Property</h2>
            <p>
              All content on this site, including text, graphics, logos, and
              images, is the property of Mothers to Daughters and is protected
              by copyright laws.
            </p>

            <h2>4. User Contributions</h2>
            <p>
              By submitting content to our site, you grant us a non-exclusive,
              royalty-free license to use, display, and distribute the content.
            </p>

            <h2>5. Prohibited Activities</h2>
            <p>You agree not to engage in activities that:</p>
            <ul>
              <li>Violate any applicable laws or regulations.</li>
              <li>Infringe upon the rights of others.</li>
              <li>Disrupt or interfere with the operation of the website.</li>
            </ul>

            <h2>6. Termination</h2>
            <p>
              We reserve the right to suspend or terminate access to our site
              for any user who violates these Terms of Use.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              Our liability is limited to the maximum extent permitted by law.
              We are not responsible for any indirect, incidental, or
              consequential damages arising from your use of the site.
            </p>

            <h2>8. Governing Law</h2>
            <p>
              These Terms of Use are governed by and construed in accordance
              with the laws of the State of New York, United States, without
              regard to its conflict of law provisions.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We may update these Terms of Use periodically. Any changes will be
              posted on this page with an updated revision date.
            </p>
          </div>
        </article>
      </Container>
    </Section>
  );
}
