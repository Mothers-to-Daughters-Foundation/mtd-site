import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Mothers to Daughters and our mission to bridge the generational gap through intergenerational wisdom.',
};

export default function AboutPage() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>About Us</h1>
          <p className={styles.heroDescription}>
            We envision a world where women of all generations thrive through
            intergenerational wisdom, driving inclusivity and gender equity for
            lasting global economic and social impact.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.content}>
            <div className={styles.textBlock}>
              <h2>Our Mission</h2>
              <p>
                We empower young women by connecting them with the wisdom and
                insights of experienced mentors, fostering personal growth,
                professional development, and meaningful intergenerational
                relationships that create lasting positive change.
              </p>
            </div>

            <div className={styles.textBlock}>
              <h2>Our Vision</h2>
              <p>
                We envision a world where women of all generations thrive through
                intergenerational wisdom, driving inclusivity and gender equity
                for lasting global economic and social impact.
              </p>
            </div>

            <div className={styles.textBlock}>
              <h2>Why We Exist</h2>
              <p>
                Mothers to Daughters was founded to bridge the generational gap
                and create meaningful connections between women of all ages. We
                believe that when wisdom is shared across generations, everyone
                benefits—mentors gain fresh perspectives, mentees gain invaluable
                guidance, and our communities become stronger.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className={styles.valuesSection}>
        <Container>
          <h2 className={styles.sectionTitle}>Our Core Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h3>Empowerment</h3>
              <p>
                We believe in empowering women to reach their full potential
                through mentorship and support.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3>Connection</h3>
              <p>
                We foster meaningful relationships that bridge generational gaps
                and create lasting bonds.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3>Inclusivity</h3>
              <p>
                We welcome women from all backgrounds, experiences, and walks of
                life.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3>Impact</h3>
              <p>
                We measure success by the positive change we create in
                individuals and communities.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
