import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mentors Mixer',
  description: 'Join our Mentors Mixer events to connect with other mentors and mentees.',
};

export default function MentorsMixerPage() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Mentors Mixer</h1>
          <p className={styles.heroDescription}>
            A dynamic networking event connecting aspiring professionals with
            experienced mentors in their industry.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.content}>
            <div className={styles.intro}>
              <h2>About Mentors Mixer</h2>
              <p>
                Mentor Mixers bring together our community for casual yet
                impactful conversations, career guidance, and professional
                network expansion. Whether you&apos;re seeking advice,
                inspiration, or new opportunities, these events are where
                connections turn into lasting relationships.
              </p>
            </div>

            <div className={styles.eventsList}>
              <h2>Our Events</h2>
              <div className={styles.eventLinks}>
                <Button href="/mentors-mixer/4.0" variant="primary" size="lg">
                  Mixer 4.0 — Rebels with a Cause
                </Button>
                <Button href="/mentors-mixer/3.0" variant="secondary" size="lg">
                  Mixer 3.0 — Women As a Powerful Force
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
