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
          <div className={styles.lastUpdated}>Last updated: October 2, 2026</div>
          <div className={styles.textContent}>
            <p>
              Mothers to Daughters (&ldquo;M2D,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a registered 501(c)(3)
              nonprofit organization. We respect your privacy and are committed
              to protecting the personal information you share with us. This
              policy explains what we collect, how we use it, and the choices you
              have.
            </p>

            <h2>Information We Collect</h2>
            <p>
              We collect information you provide directly—such as your name,
              email address, and phone number when you sign up, contact us,
              register for a program or event, volunteer, or subscribe to our
              newsletter. When you make a donation or purchase a membership, our
              payment processors collect the billing details needed to complete
              your transaction. We also collect limited technical information
              (such as device and usage data) automatically when you visit our
              website.
            </p>

            <h2>How We Use Your Information</h2>
            <p>
              We use your information to operate our mentorship programs and
              events, match mentors and mentees, process donations and
              memberships, respond to your inquiries, send updates you&apos;ve
              requested, and improve our services. We do not sell your personal
              information.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              We rely on trusted third parties to run our programs, including
              Zeffy for payment processing and Supabase for data
              storage. These providers process your information only as needed to
              deliver their services and under their own privacy and security
              commitments.
            </p>

            <h2>Data Security &amp; Retention</h2>
            <p>
              We take reasonable administrative and technical measures to protect
              your information and retain it only as long as necessary for the
              purposes described here or as required by law.
            </p>

            <h2>Your Rights &amp; Choices</h2>
            <p>
              You may request access to, correction of, or deletion of your
              personal information, and you can unsubscribe from our emails at any
              time using the link in any message or by contacting us. We will
              respond to reasonable requests consistent with applicable law.
            </p>

            <h2>Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to children under 13, and we do not
              knowingly collect personal information from them.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will
              be posted on this page with a revised &ldquo;Last updated&rdquo;
              date.
            </p>

            <h2>Contact Us</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href="mailto:connect@motherstodaughters.org">
                connect@motherstodaughters.org
              </a>{' '}
              or write to us at 1001 6th Ave, New York, NY 10018.
            </p>
          </div>
        </article>
      </Container>
    </Section>
  );
}
