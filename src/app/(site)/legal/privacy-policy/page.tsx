import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from '../terms/page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Mothers to Daughters.',
};

// Carried over word for word from motherstodaughters.org/privacy-policy.
// A revised policy covering onboarding answers and AI-assisted matching is
// with the council for review; replace this text once it is approved.
export default function PrivacyPolicyPage() {
  return (
    <Section spacing="lg">
      <Container>
        <article className={styles.content}>
          <h1>Privacy Policy</h1>
          <div className={styles.lastUpdated}>Last updated: June 20, 2025</div>
          <div className={styles.textContent}>
            <p>
              At Mothers to Daughters, we prioritize your privacy. This Privacy Policy outlines how
              we collect, use, and protect your personal information when you visit our website,
              motherstodaughters.org.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
              <li>
                <strong>Personal Identification Information:</strong> Name, email address, etc.
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type, operating system,
                referring URLs, and browsing behavior.
              </li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>Your information may be used to:</p>
            <ul>
              <li>Provide and improve our services.</li>
              <li>Respond to inquiries and support requests.</li>
              <li>Send newsletters and promotional materials (with your consent).</li>
            </ul>

            <h2>3. Data Sharing and Disclosure</h2>
            <p>
              We do not sell or rent your personal information. We may share data with trusted third
              parties who assist in operating our website, conducting our business, or servicing
              you, provided they agree to keep this information confidential.
            </p>

            <h2>4. Your Data Protection Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access, correct, or delete your personal data.</li>
              <li>Object to or restrict processing.</li>
              <li>Withdraw consent at any time.</li>
            </ul>
            <p>
              To exercise these rights, please contact us at{' '}
              <a href="mailto:connect@motherstodaughters.org">connect@motherstodaughters.org</a>.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal
              information.
            </p>

            <h2>6. Cookies</h2>
            <p>
              Our website uses cookies to enhance user experience. You can control cookie settings
              through your browser.
            </p>

            <h2>7. Third-Party Links</h2>
            <p>
              Our site may contain links to external websites. We are not responsible for the
              content or privacy practices of these sites.
            </p>

            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Any changes will be posted on this
              page with an updated revision date.
            </p>
          </div>
        </article>
      </Container>
    </Section>
  );
}
