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
            Connect with fellow mentors and mentees at our signature networking
            events.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.content}>
            <div className={styles.intro}>
              <h2>About Mentors Mixer</h2>
              <p>
                Mentors Mixer events bring together our community of mentors and
                mentees for networking, learning, and celebration. These events
                provide opportunities to connect, share experiences, and build
                lasting relationships.
              </p>
            </div>

            <div className={styles.eventsList}>
              <h2>Upcoming Events</h2>
              <div className={styles.eventLinks}>
                <Button href="/mentors-mixer/4.0" variant="primary" size="lg">
                  Mentors Mixer 4.0
                </Button>
                <Button href="/mentors-mixer/3.0" variant="secondary" size="lg">
                  Mentors Mixer 3.0
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
