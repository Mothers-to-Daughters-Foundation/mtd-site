import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Programs',
  description:
    'Explore the M2D Intergenerational Mentoring Program—a six-month, no-cost journey equipping young women to lead.',
};

const INTEREST_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfGETNfWrbzLiA4TJUTX5Ki--Zhnj2Mu5UzUxbjceTGTUUspw/viewform';

const impactStats = [
  { number: '5+', label: 'Years empowering women' },
  { number: '100+', label: 'Mentorship pairs formed' },
  { number: '200+', label: 'Hybrid networking events since 2020' },
  { number: '50,000+', label: 'Online engagements' },
];

export default function ProgramsPage() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Our Programs</h1>
          <p className={styles.heroDescription}>
            We offer transformative programs that connect women across
            generations, fostering growth, learning, and meaningful
            relationships.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.programsGrid}>
            <Card className={styles.featuredCard}>
              <div className={styles.cardImage}>
                <Image
                  src={getImagePath('/images/intergenerational.jpg')}
                  alt="Women connecting through intergenerational mentorship"
                  width={600}
                  height={338}
                  className={styles.cardImageContent}
                />
              </div>
              <div className={styles.cardContent}>
                <h2>M2D Intergenerational Mentoring Program</h2>
                <p>
                  A high-impact mentorship program designed to equip young women
                  with the entrepreneurial mindset, strategies, and leadership
                  skills needed to excel. Through immersive mentorship and
                  hands-on workshops, participants engage in a transformational
                  six-month journey—at no cost.
                </p>
                <p>
                  <strong>Invest in yourself. Build your legacy. Enroll today.</strong>
                </p>
                <div className={styles.cardActions}>
                  <Button
                    href="/programs/intergenerational-mentoring"
                    variant="primary"
                    size="md"
                  >
                    Learn More
                  </Button>
                  <Button
                    as="a"
                    href={INTEREST_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    size="md"
                  >
                    Interest Form ↗
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className={styles.outcomesSection}>
        <Container>
          <h2 className={styles.sectionTitle}>Our Impact So Far</h2>
          <div className={styles.outcomesGrid}>
            {impactStats.map((stat) => (
              <div key={stat.label} className={styles.outcomeCard}>
                <div className={styles.outcomeNumber}>{stat.number}</div>
                <div className={styles.outcomeLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.commitment}>
            <h2>Our Commitment</h2>
            <p>
              We&apos;re working to support{' '}
              <strong>100,000 business launches by 2035</strong>—equipping the
              next generation of women to build economic independence and lasting
              legacies. Your partnership and support help make that future
              possible.
            </p>
            <Button href="/donate" variant="primary" size="lg">
              Support the Mission
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
