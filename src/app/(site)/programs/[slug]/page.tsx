import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

interface ProgramDetailPageProps {
  params: {
    slug: string;
  };
}

// This will be replaced with actual data from MDX or CMS during migration
const programs: Record<string, any> = {
  'intergenerational-mentoring': {
    title: 'M2D Intergenerational Mentoring Program',
    subtitle: 'A Transformational Six-Month Journey—At No Cost',
    description:
      'A high-impact mentorship program designed to equip young women with the entrepreneurial mindset, strategies, and leadership skills needed to excel. Through immersive mentorship and hands-on workshops, participants engage in a transformational six-month journey—at no cost.',
    tagline: 'Invest in yourself. Build your legacy. Enroll today.',
    mission:
      'Our Commitment is to support 100,000 business launches by 2035.',
    impact: [
      { value: '5+', label: 'years of empowering women' },
      { value: '100+', label: 'mentorship pairs formed' },
      { value: '200+', label: 'hybrid networking events since 2020' },
      { value: '50,000+', label: 'online engagements' },
    ],
    commitment: [
      { value: '100,000', label: 'businesses by 2035' },
      { value: '1,000,000+', label: 'funding required' },
    ],
    testimonials: [
      {
        quote:
          'The mentorship I received through Mothers to Daughters gave me the clarity and confidence to take the next step in my career. Having someone believe in me changed everything.',
        author: 'Wan Chung, Daughter, Fall 2024 Cohort',
      },
    ],
  },
};

const INTEREST_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfGETNfWrbzLiA4TJUTX5Ki--Zhnj2Mu5UzUxbjceTGTUUspw/viewform';

export async function generateStaticParams() {
  return Object.keys(programs).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: ProgramDetailPageProps): Promise<Metadata> {
  const program = programs[params.slug];

  if (!program) {
    return {
      title: 'Program Not Found',
    };
  }

  return {
    title: program.title,
    description: program.description,
  };
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const program = programs[params.slug];

  if (!program) {
    notFound();
  }

  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>{program.title}</h1>
          {program.subtitle && (
            <p className={styles.heroSubtitle}>{program.subtitle}</p>
          )}
          <p className={styles.heroDescription}>{program.description}</p>
          {program.tagline && (
            <p className={styles.heroTagline}>{program.tagline}</p>
          )}
          <div className={styles.heroCta}>
            <a href="#program-impact" className={styles.heroButtonSecondary}>
              Learn More
            </a>
            <a
              href={INTEREST_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroButton}
            >
              Interest Form ↗
            </a>
          </div>
        </Container>
      </Section>

      {program.mission && (
        <Section spacing="lg" className={styles.mission}>
          <Container>
            <p className={styles.missionText}>{program.mission}</p>
          </Container>
        </Section>
      )}

      {(program.impact?.length || program.commitment?.length) && (
        <Section spacing="lg">
          <Container>
            <div id="program-impact" className={styles.statsGrid}>
              {program.impact?.length > 0 && (
                <div className={styles.statGroup}>
                  <h2>Our Impact</h2>
                  <ul className={styles.statList}>
                    {program.impact.map((stat: any, index: number) => (
                      <li key={index} className={styles.stat}>
                        <span className={styles.statValue}>{stat.value}</span>
                        <span className={styles.statLabel}>{stat.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {program.commitment?.length > 0 && (
                <div className={styles.statGroup}>
                  <h2>Our Commitment</h2>
                  <ul className={styles.statList}>
                    {program.commitment.map((stat: any, index: number) => (
                      <li key={index} className={styles.stat}>
                        <span className={styles.statValue}>{stat.value}</span>
                        <span className={styles.statLabel}>{stat.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </Section>
      )}

      {program.testimonials && program.testimonials.length > 0 && (
        <Section spacing="lg" className={styles.storiesSection}>
          <Container>
            <div className={styles.content}>
              <div className={styles.section}>
                <h2>Impact Stories</h2>
                <div className={styles.testimonials}>
                  {program.testimonials.map(
                    (testimonial: any, index: number) => (
                      <blockquote key={index} className={styles.testimonial}>
                        <p>&ldquo;{testimonial.quote}&rdquo;</p>
                        <cite>— {testimonial.author}</cite>
                      </blockquote>
                    )
                  )}
                </div>
              </div>

              <div className={styles.cta}>
                <Button
                  as="a"
                  href={INTEREST_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="lg"
                >
                  Complete the Interest Form ↗
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
