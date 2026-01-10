import { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Programs',
  description:
    'Explore our mentorship programs designed to empower young women through intergenerational wisdom.',
};

export default function ProgramsPage() {
  const programs = [
    {
      slug: 'intergenerational-mentoring',
      title: 'Intergenerational Mentoring Program',
      description:
        'A high-impact mentorship program designed to equip young women with the entrepreneurial mindset, strategies, and leadership skills needed to excel. Through immersive mentorship and hands-on workshops.',
      image: '/images/programs/mentoring.jpg',
      featured: true,
    },
    // Add more programs here during content migration
  ];

  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Our Programs</h1>
          <p className={styles.heroDescription}>
            We offer transformative programs that connect women across
            generations, fostering growth, learning, and meaningful relationships.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.programsGrid}>
            {programs.map((program) => (
              <Card
                key={program.slug}
                href={`/programs/${program.slug}`}
                className={program.featured ? styles.featuredCard : ''}
              >
                <div className={styles.cardImage}>
                  <div className={styles.imagePlaceholder}>
                    <span>Program Image</span>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h2>{program.title}</h2>
                  <p>{program.description}</p>
                  <Button
                    href={`/programs/${program.slug}`}
                    variant="primary"
                    size="md"
                  >
                    Learn More
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {programs.length === 0 && (
            <div className={styles.placeholder}>
              <p>Program information will be added during content migration.</p>
            </div>
          )}
        </Container>
      </Section>

      <Section spacing="lg" className={styles.outcomesSection}>
        <Container>
          <h2 className={styles.sectionTitle}>Program Outcomes</h2>
          <div className={styles.outcomesGrid}>
            <div className={styles.outcomeCard}>
              <div className={styles.outcomeNumber}>95%</div>
              <div className={styles.outcomeLabel}>
                of mentees report clarity in goals
              </div>
            </div>
            <div className={styles.outcomeCard}>
              <div className={styles.outcomeNumber}>89%</div>
              <div className={styles.outcomeLabel}>
                increase in confidence levels
              </div>
            </div>
            <div className={styles.outcomeCard}>
              <div className={styles.outcomeNumber}>100%</div>
              <div className={styles.outcomeLabel}>
                of participants recommend the program
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
