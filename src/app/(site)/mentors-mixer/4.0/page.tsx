import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mentors Mixer 4.0 — Rebels with a Cause',
  description:
    'Mentors Mixer 4.0: "Rebels with a Cause" — May 30th, 2024 at Gotstyle Distillery.',
};

const speakers = [
  { name: 'Arnella Renda', role: 'Real Estate Broker' },
  { name: 'Shein Zutshi', role: 'Educational Consultant' },
  { name: 'Maria Carolina Ojeda', role: 'Entrepreneur' },
  { name: 'Satie Narain-Simon', role: 'CRA Senior Tax Auditor' },
  { name: 'Nunu Francisco', role: 'Tech Programs Lead, Black Entrepreneurship Alliance' },
  { name: 'Evangeline Chima', role: 'Founder, Black Mentorship Inc.' },
];

export default function MentorsMixer40Page() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Mentors Mixer 4.0</h1>
          <p className={styles.heroDescription}>
            &ldquo;Rebels with a Cause&rdquo; &middot; May 30th, 2024 &middot;
            Gotstyle Distillery
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.content}>
            <div className={styles.section}>
              <h2>About the Event</h2>
              <p>
                An evening connecting youth changemakers with industry
                disruptors who think outside the box. The night featured
                networking, refreshments, pop-up vendors, and live performances
                from high school bands and DJs. Attendees were encouraged to
                channel the era and wear their best 1990s high school attire.
              </p>
            </div>

            <div className={styles.section}>
              <h2>A Cause Worth Celebrating</h2>
              <p>
                6IX Academy students partnered with Foxy Customs to launch hair
                barrettes and necklace pendants, with proceeds supporting
                Womenmind through CAMH.
              </p>
            </div>

            <div className={styles.section}>
              <h2>Featured Mentors &amp; Speakers</h2>
              <ul className={styles.speakerList}>
                {speakers.map((speaker) => (
                  <li key={speaker.name} className={styles.speakerItem}>
                    <span className={styles.speakerName}>{speaker.name}</span>
                    <span className={styles.speakerRole}>{speaker.role}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.cta}>
              <Button href="/contact" variant="primary" size="lg">
                Get in Touch About Our Next Mixer
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
