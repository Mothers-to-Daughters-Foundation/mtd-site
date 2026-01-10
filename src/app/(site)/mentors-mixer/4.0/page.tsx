import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mentors Mixer 4.0',
  description: 'Join us for Mentors Mixer 4.0 - our latest networking event.',
};

export default function MentorsMixer40Page() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Mentors Mixer 4.0</h1>
          <p className={styles.heroDescription}>
            Join us for our fourth annual Mentors Mixer event.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.content}>
            <div className={styles.section}>
              <h2>Event Description & Goals</h2>
              <p>
                Event details will be added during content migration from Wix.
              </p>
            </div>

            <div className={styles.section}>
              <h2>Speakers & Highlights</h2>
              <p>Speaker information will be added during content migration.</p>
            </div>

            <div className={styles.section}>
              <h2>Photos & Videos</h2>
              <p>Media gallery will be added during content migration.</p>
            </div>

            <div className={styles.cta}>
              <Button href="/contact" variant="primary" size="lg">
                RSVP / Get Tickets
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
