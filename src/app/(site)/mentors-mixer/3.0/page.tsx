import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mentors Mixer 3.0',
  description: 'Recap of Mentors Mixer 3.0 - our third annual networking event.',
};

export default function MentorsMixer30Page() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Mentors Mixer 3.0</h1>
          <p className={styles.heroDescription}>
            A look back at our third annual Mentors Mixer event.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.content}>
            <div className={styles.section}>
              <h2>Event Recap</h2>
              <p>
                Event details and recap will be added during content migration
                from Wix.
              </p>
            </div>

            <div className={styles.section}>
              <h2>Highlights & Speakers</h2>
              <p>Speaker information will be added during content migration.</p>
            </div>

            <div className={styles.section}>
              <h2>Photos & Videos</h2>
              <p>Media gallery will be added during content migration.</p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
