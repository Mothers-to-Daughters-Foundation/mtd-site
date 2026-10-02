import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
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
          <div className={styles.content}>
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
                We envision a world where women of all generations thrive through
                intergenerational wisdom, driving inclusivity and gender equity
                for lasting global economic and social impact. Society thrives
                when women lead, innovate, and shape the future.
              </p>
            </div>

            <div className={styles.textBlock}>
              <h2>Who We Are</h2>
              <p>
                Mothers to Daughters is a 501(c)(3) tax-exempt nonprofit working
                to address the systemic inequities that hold women back from
                leadership and innovation opportunities. We bridge the
                generational gap and create meaningful connections between women
                of all ages—because when wisdom is shared across generations,
                everyone benefits. Mentors gain fresh perspectives, mentees gain
                invaluable guidance, and our communities become stronger.
              </p>
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
