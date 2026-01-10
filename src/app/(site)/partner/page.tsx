import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import ContactForm from '@/components/forms/ContactForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Become a Partner',
  description:
    'Partner with Mothers to Daughters to make a lasting impact. Learn about partnership opportunities.',
};

export default function PartnerPage() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Become a Partner</h1>
          <p className={styles.heroDescription}>
            Whether you give your time, expertise, or financial support, you are
            shaping futures and changing lives.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.intro}>
            <p>
              Your generosity, alongside our community of supporters, fuels our
              mission and brings us closer to empowering the next generation.
            </p>
          </div>

          <div className={styles.partnershipTypes}>
            <h2>Types of Partnership</h2>
            <div className={styles.typesGrid}>
              <div className={styles.typeCard}>
                <h3>Financial Support</h3>
                <p>
                  Direct financial contributions help us expand our programs and
                  reach more women.
                </p>
              </div>
              <div className={styles.typeCard}>
                <h3>In-Kind Support</h3>
                <p>
                  Donate services, resources, or expertise that directly benefit
                  our programs and participants.
                </p>
              </div>
              <div className={styles.typeCard}>
                <h3>Mentorship</h3>
                <p>
                  Become a mentor and share your wisdom and experience with the
                  next generation.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.benefits}>
            <h2>Partnership Benefits</h2>
            <ul className={styles.benefitsList}>
              <li>Recognition on our website and at events</li>
              <li>Access to our community of changemakers</li>
              <li>Impact reports showing your contribution&apos;s effect</li>
              <li>Networking opportunities with other partners</li>
              <li>The satisfaction of making a real difference</li>
            </ul>
          </div>

          <div className={styles.partners}>
            <h2>Our Partners</h2>
            <div className={styles.partnerLogos}>
              {/* Partner logos will be added during content migration */}
              <p className={styles.placeholder}>
                Partner logos will be displayed here.
              </p>
            </div>
          </div>

          <div className={styles.ctaSection}>
            <h2>Ready to Partner With Us?</h2>
            <p>Get in touch to discuss partnership opportunities.</p>
            <div className={styles.formContainer}>
              <ContactForm />
            </div>
            <div className={styles.alternative}>
              <p>Or reach out directly:</p>
              <Button href="/contact" variant="secondary" size="md">
                Contact Us
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
