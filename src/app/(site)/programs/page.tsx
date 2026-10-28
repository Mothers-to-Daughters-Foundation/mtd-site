import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgramCarousel from '@/components/programs/ProgramCarousel';
import ImpactStories from '@/components/marketing/ImpactStories';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Programs',
  description:
    'Explore the M2D Intergenerational Mentoring Program—a six-month, no-cost journey equipping young women to lead.',
};

const INTEREST_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfGETNfWrbzLiA4TJUTX5Ki--Zhnj2Mu5UzUxbjceTGTUUspw/viewform';

const impactStats = [
  { number: '5+', label: 'years of empowering women' },
  { number: '100+', label: 'mentorship pairs formed' },
  { number: '200+', label: 'hybrid networking events since 2020' },
  { number: '50,000+', label: 'online engagements' },
];

const commitmentStats = [
  { number: '100,000', label: 'businesses by 2035' },
  { number: '1,000,000+', label: 'funding required' },
];

export default function ProgramsPage() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>M2D Intergenerational Mentoring Program</h1>
          <p className={styles.heroDescription}>
            A Transformational Six-Month Journey—At No Cost
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.featureRow}>
            <Card className={styles.featuredCard} variant="static">
              <div className={styles.cardContent}>
                <p>
                  Mothers to Daughters (M2D) offers a high-impact mentorship
                  program designed to equip young women with the entrepreneurial
                  mindset, strategies, and leadership skills needed to excel.
                  Through immersive mentorship and hands-on workshops.
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
            <ProgramCarousel />
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className={styles.outcomesSection}>
        <Container>
          <p className={styles.commitmentStatement}>
            Our Commitment is to support 100,000 business launches by 2035.
          </p>

          <h2 className={styles.sectionTitle}>Our Impact</h2>
          <ul className={styles.outcomesGrid}>
            {impactStats.map((stat) => (
              <li key={stat.label} className={styles.outcomeCard}>
                <div className={styles.outcomeNumber}>{stat.number}</div>
                <div className={styles.outcomeLabel}>{stat.label}</div>
              </li>
            ))}
          </ul>

          <h2 className={styles.sectionTitle}>Our Commitment:</h2>
          <ul className={`${styles.outcomesGrid} ${styles.commitmentGrid}`}>
            {commitmentStats.map((stat) => (
              <li key={stat.label} className={styles.outcomeCard}>
                <div className={styles.outcomeNumber}>{stat.number}</div>
                <div className={styles.outcomeLabel}>{stat.label}</div>
              </li>
            ))}
          </ul>

          <div className={styles.commitment}>
            <Button href="/donate" variant="primary" size="lg">
              Support the Mission
            </Button>
          </div>
        </Container>
      </Section>

      <ImpactStories limit={1} />
    </>
  );
}
