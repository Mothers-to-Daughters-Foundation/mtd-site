import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Bridging the Generational Gap - We envision a world where women of all generations thrive through intergenerational wisdom.',
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Bridging the Generational Gap</h1>
            <p className={styles.heroDescription}>
              We envision a world where women of all generations thrive through
              intergenerational wisdom
            </p>
            <div className={styles.heroActions}>
              <Button href="/donate" variant="primary" size="lg">
                Donate
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Contact Us
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Vision Section */}
      <Section spacing="lg">
        <Container>
          <div className={styles.twoColumn}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>Vision</h2>
              <p className={styles.sectionText}>
                We envision a world where women of all generations thrive through
                intergenerational wisdom, driving inclusivity and gender equity
                for lasting global economic and social impact.
              </p>
            </div>
            <div className={styles.imageContent}>
              {/* Image placeholder - will be replaced with actual image */}
              <div className={styles.imagePlaceholder}>
                <span>Vision Image</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Mission Section */}
      <Section spacing="lg" className={styles.alternateBg}>
        <Container>
          <div className={styles.twoColumnReverse}>
            <div className={styles.imageContent}>
              {/* Image placeholder - will be replaced with actual image */}
              <div className={styles.imagePlaceholder}>
                <span>Mission Image</span>
              </div>
            </div>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>Mission</h2>
              <p className={styles.sectionText}>
                We empower young women by connecting them with the wisdom and
                insights of experienced mentors, fostering personal growth,
                professional development, and meaningful intergenerational
                relationships that create lasting positive change.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Programs Section */}
      <Section spacing="lg">
        <Container>
          <div className={styles.twoColumn}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>Programs</h2>
              <h3 className={styles.subtitle}>
                Intergenerational Mentoring Program
              </h3>
              <p className={styles.sectionText}>
                Mothers to Daughters (M2D) offers a high-impact mentorship
                program designed to equip young women with the entrepreneurial
                mindset, strategies, and leadership skills needed to excel.
                Through immersive mentorship and hands-on workshops.
              </p>
              <Button href="/programs" variant="primary" size="md">
                View Details
              </Button>
            </div>
            <div className={styles.imageContent}>
              {/* Image placeholder - will be replaced with actual image */}
              <div className={styles.imagePlaceholder}>
                <span>Programs Image</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Partner With Us Section */}
      <Section spacing="lg" className={styles.alternateBg}>
        <Container>
          <div className={styles.twoColumnReverse}>
            <div className={styles.imageContent}>
              {/* Image placeholder - will be replaced with actual image */}
              <div className={styles.imagePlaceholder}>
                <span>Partner Image</span>
              </div>
            </div>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>Partner With Us</h2>
              <p className={styles.sectionText}>
                Whether you give your time, expertise, or financial support, you
                are shaping futures and changing lives. Your generosity, alongside
                our community of supporters, fuels our mission and brings us
                closer to empowering the next generation.
              </p>
              <Button href="/partner" variant="primary" size="md">
                Learn More
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Our Impact Section */}
      <Section spacing="lg" className={styles.impactSection}>
        <Container>
          <h2 className={styles.impactTitle}>Our Impact</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏱</div>
              <div className={styles.statNumber}>3</div>
              <div className={styles.statLabel}>Years in the Business</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statNumber}>49+</div>
              <div className={styles.statLabel}>Women Mentored</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statNumber}>147+</div>
              <div className={styles.statLabel}>Events Held</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statNumber}>$97,822</div>
              <div className={styles.statLabel}>Donations</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Impact Stories Section */}
      <Section spacing="lg" className={styles.storiesSection}>
        <Container>
          <h2 className={styles.sectionTitle}>Impact Stories</h2>
          <div className={styles.storiesContent}>
            {/* Testimonials will be added here during content migration */}
            <p className={styles.storiesPlaceholder}>
              Impact stories and testimonials will be displayed here.
            </p>
          </div>
        </Container>
      </Section>

      {/* Sponsors Section */}
      <Section spacing="md" className={styles.sponsorsSection}>
        <Container>
          <div className={styles.sponsorsCarousel}>
            {/* Sponsor logos will be added here during content migration */}
            <div className={styles.sponsorPlaceholder}>
              <span>Sponsor Logos</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* Final CTA Section */}
      <Section spacing="xl" className={styles.ctaSection}>
        <Container>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              She Could Be Your Daughter. Your Sister. Your Future Leader.
            </h2>
            <Button href="/donate" variant="primary" size="lg">
              Donate Now
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
