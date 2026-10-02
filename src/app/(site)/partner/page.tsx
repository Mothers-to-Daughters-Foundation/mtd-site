import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import ContactForm from '@/components/forms/ContactForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Become a Partner',
  description:
    'Partner with Mothers to Daughters to make a lasting impact. Explore monetary and non-monetary partnership opportunities.',
};

const monetaryTiers = [
  {
    name: 'Legacy Partner',
    amount: '$100,000+',
    description:
      'Lead funding, policy advocacy, research partnerships, and strategic advisory positions. Ideal for government and public-sector leaders.',
  },
  {
    name: 'Pioneer Partner',
    amount: '$75,000 – $99,999',
    description:
      'Signature summit sponsorship, premier branding, VIP speaking opportunities, and program development input.',
  },
  {
    name: 'Visionary Partner',
    amount: '$50,000 – $74,999',
    description:
      'Regional mentorship sponsorships, annual report recognition, networking event access, and collaborative development.',
  },
  {
    name: 'Empowerment Partner',
    amount: '$25,000 – $49,999',
    description:
      'Flagship program sponsorship, prominent branding, panel speaking roles, and gender equity research collaboration.',
  },
  {
    name: 'Impact Partner',
    amount: '$10,000 – $24,999',
    description:
      'Event sponsorships with platform recognition and research opportunities.',
  },
  {
    name: 'Catalyst Partner',
    amount: '$5,000 – $9,999',
    description:
      'Initiative support with marketing recognition and workshop access.',
  },
  {
    name: 'Champion Partner',
    amount: '$1,000 – $4,999',
    description: 'Digital recognition and leadership event access.',
  },
];

const nonMonetaryTiers = [
  {
    name: 'Strategic Ally',
    description:
      'Venue hosting, professional services, technology support, and media production.',
  },
  {
    name: 'Collaborative Partner',
    description:
      'Joint programming, resource-sharing, co-developed workshops, and funding proposals.',
  },
];

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
              Intentional actions create impact—big or small, it matters.
              Together we create meaningful dialogue, foster deep connections,
              and amplify shared values through intergenerational mentorship and
              women&apos;s empowerment.
            </p>
          </div>

          <div className={styles.partnershipTypes}>
            <h2>Monetary Partnerships</h2>
            <div className={styles.tierGrid}>
              {monetaryTiers.map((tier) => (
                <div key={tier.name} className={styles.tierCard}>
                  <div className={styles.tierAmount}>{tier.amount}</div>
                  <h3>{tier.name}</h3>
                  <p>{tier.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.partnershipTypes}>
            <h2>Non-Monetary Partnerships</h2>
            <div className={styles.typesGrid}>
              {nonMonetaryTiers.map((tier) => (
                <div key={tier.name} className={styles.typeCard}>
                  <h3>{tier.name}</h3>
                  <p>{tier.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.ctaSection}>
            <h2>Ready to Partner With Us?</h2>
            <p>
              Get in touch to discuss partnership opportunities, or email us at{' '}
              <a href="mailto:connect@motherstodaughters.org">
                connect@motherstodaughters.org
              </a>
              .
            </p>
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
