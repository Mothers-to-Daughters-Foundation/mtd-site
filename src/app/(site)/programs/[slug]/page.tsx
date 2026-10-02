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
    title: 'Intergenerational Mentoring Program',
    description:
      'A high-impact mentorship program designed to equip young women with the entrepreneurial mindset, strategies, and leadership skills needed to excel.',
    whoItsFor: [
      'Young women seeking guidance and mentorship',
      'Women looking to develop leadership skills',
      'Those interested in entrepreneurship and career growth',
    ],
    whatYoullGet: [
      'One-on-one mentorship with experienced leaders',
      'Hands-on workshops and skill-building sessions',
      'Access to a supportive community of women',
      'Networking opportunities and professional development',
    ],
    schedule:
      'A transformational six-month journey, offered at no cost to participants. Complete the interest form and our team will share upcoming cohort dates.',
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
          <p className={styles.heroDescription}>{program.description}</p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.content}>
            <div className={styles.section}>
              <h2>Who It&apos;s For</h2>
              <ul className={styles.list}>
                {program.whoItsFor?.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h2>What You&apos;ll Get</h2>
              <ul className={styles.list}>
                {program.whatYoullGet?.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h2>Schedule & Cohorts</h2>
              <p>{program.schedule}</p>
            </div>

            {program.testimonials && program.testimonials.length > 0 && (
              <div className={styles.section}>
                <h2>What Participants Say</h2>
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
            )}

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
    </>
  );
}
