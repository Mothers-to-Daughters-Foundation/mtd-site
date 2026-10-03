import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Mothers to Daughters is a global movement forging deep connections across generations, amplifying women’s voices, and driving meaningful action.',
};

const values = [
  {
    title: 'Radical Inclusion & Trust',
    description:
      'We create spaces where every woman is seen, heard, and valued, and where trust is the foundation of everything we build together.',
  },
  {
    title: 'Excellence & Impact',
    description:
      'We hold ourselves to the highest standard, ensuring our work leaves a lasting legacy through strategic, intentional mentorship.',
  },
  {
    title: 'Collective Empowerment',
    description:
      'We connect generations through shared wisdom and mutual support, because when one woman rises, we all rise.',
  },
  {
    title: 'Fearless Innovation',
    description:
      'We challenge the status quo with bold ideas and creative solutions that move women and communities forward.',
  },
];

const milestones = [
  {
    date: 'March 2020',
    text: 'Mothers to Daughters (M2D) was born—a vibrant community where women come together to uplift, mentor, and empower one another.',
  },
  {
    date: 'January 2021',
    text: 'A new chapter began as M2D was officially incorporated as a not-for-profit, laying the foundation for long-term impact with the establishment of our dedicated board.',
  },
  {
    date: 'June 2022',
    text: 'We proudly launched our flagship mentorship programs, Legacy Building Apprenticeship & Guiding Lights, designed to cultivate leadership, resilience, and intergenerational wisdom.',
  },
  {
    date: 'March 2023',
    text: 'Connection and collaboration took center stage as we hosted our first networking event in partnership with 6ix Academy, fostering meaningful relationships and professional growth.',
  },
  {
    date: 'November 2024',
    text: 'M2D was officially granted 501(c)(3) status in the United States, expanding our ability to serve and support women globally.',
  },
  {
    date: 'March 2025',
    text: "M2D marks its 5th anniversary with a bold presence on billboards at Toronto's Dundas Square and Exhibition Place, showcasing our unwavering commitment to empowering women worldwide.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>About Us</h1>
          <p className={styles.heroDescription}>
            We envision a society that thrives when women lead, innovate, and
            shape the future through mentorship and collective empowerment.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.lead}>
            <div className={styles.leadText}>
              <div className={styles.textBlock}>
                <h2>Our Mission</h2>
                <p>
                  Mothers to Daughters is a global movement dedicated to forging
                  deep connections, amplifying voices, and driving meaningful
                  action. We empower young women by connecting them with the
                  wisdom and insights of experienced mentors, fostering personal
                  growth, professional development, and meaningful
                  intergenerational relationships.
                </p>
              </div>

              <div className={styles.textBlock}>
                <h2>Our Vision</h2>
                <p>
                  We envision a world where women of all generations thrive
                  through intergenerational wisdom, driving inclusivity and
                  gender equity for lasting global economic and social impact.
                  Society thrives when women lead, innovate, and shape the
                  future.
                </p>
              </div>

              <div className={styles.textBlock}>
                <h2>Who We Are</h2>
                <p>
                  Mothers to Daughters is a 501(c)(3) tax-exempt nonprofit
                  working to address the systemic inequities that hold women back
                  from leadership and innovation opportunities. We bridge the
                  generational gap and create meaningful connections between
                  women of all ages—because when wisdom is shared across
                  generations, everyone benefits.
                </p>
              </div>
            </div>

            <div className={styles.leadImage}>
              <Image
                src={getImagePath('/images/about/about-hero.png')}
                alt="Three women from different generations sitting together"
                width={600}
                height={1067}
                className={styles.leadImageContent}
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className={styles.valuesSection}>
        <Container>
          <h2 className={styles.sectionTitle}>Our Core Values</h2>
          <div className={styles.valuesGrid}>
            {values.map((value) => (
              <div key={value.title} className={styles.valueCard}>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className={styles.timelineSection}>
        <Container>
          <h2 className={styles.sectionTitle}>Our Journey</h2>
          <ol className={styles.timeline}>
            {milestones.map((milestone) => (
              <li key={milestone.date} className={styles.milestone}>
                <div className={styles.milestoneMarker} aria-hidden="true" />
                <div className={styles.milestoneBody}>
                  <div className={styles.milestoneDate}>{milestone.date}</div>
                  <p className={styles.milestoneText}>{milestone.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <blockquote className={styles.testimonial}>
            <p className={styles.testimonialQuote}>
              &ldquo;The mentorship I received through Mothers to Daughters gave
              me the clarity and confidence to take the next step in my career.
              Having someone believe in me changed everything.&rdquo;
            </p>
            <cite className={styles.testimonialAuthor}>
              Wan Chung &mdash; Daughter, Fall 2024 Cohort
            </cite>
          </blockquote>
        </Container>
      </Section>
    </>
  );
}
