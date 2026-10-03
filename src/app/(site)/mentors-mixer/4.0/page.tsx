import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mentors Mixer 4.0 — Rebels with a Cause',
  description:
    'Mentors Mixer 4.0: "Rebels with a Cause" — May 30th, 2024 at Gotstyle Distillery.',
};

const speakers = [
  { name: 'Arnella Renda', role: 'Real Estate Broker', image: '/images/mixers/speakers/arnella-renda.png' },
  { name: 'Shein Zutshi', role: 'Educational Consultant', image: '/images/mixers/speakers/shein-zutshi.png' },
  { name: 'Maria Carolina Ojeda', role: 'Entrepreneur', image: '/images/mixers/speakers/maria-carolina-ojeda.png' },
  { name: 'Satie Narain-Simon', role: 'CRA Senior Tax Auditor', image: '/images/mixers/speakers/satie-narain-simon.png' },
  { name: 'Nunu Francisco', role: 'Tech Programs Lead, Black Entrepreneurship Alliance', image: '/images/mixers/speakers/nunu-francisco.jpg' },
  { name: 'Evangeline Chima', role: 'Founder, Black Mentorship Inc.', image: '/images/mixers/speakers/evangeline-chima.jpg' },
];

const gallery = [1, 2, 3, 4, 5, 6].map((n) => `/images/mixers/mixer-4-0-gallery-${n}.jpg`);

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

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

      <Section spacing="none">
        <Container>
          <div className={styles.heroImage}>
            <Image
              src={getImagePath('/images/mixers/mixer-4-0-hero.png')}
              alt="Mentors Mixer 4.0 — Rebels with a Cause"
              width={1234}
              height={556}
              className={styles.heroImageContent}
              priority
            />
          </div>
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
                    <div className={styles.speakerPhoto}>
                      {speaker.image ? (
                        <Image
                          src={getImagePath(speaker.image)}
                          alt={speaker.name}
                          width={400}
                          height={400}
                          className={styles.speakerImage}
                        />
                      ) : (
                        <div className={styles.speakerInitials}>
                          <span>{initials(speaker.name)}</span>
                        </div>
                      )}
                    </div>
                    <span className={styles.speakerName}>{speaker.name}</span>
                    <span className={styles.speakerRole}>{speaker.role}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h2>Event Gallery</h2>
              <div className={styles.gallery}>
                {gallery.map((src, i) => (
                  <div key={src} className={styles.galleryItem}>
                    <Image
                      src={getImagePath(src)}
                      alt={`Mentors Mixer 4.0 photo ${i + 1}`}
                      width={900}
                      height={675}
                      className={styles.galleryImage}
                    />
                  </div>
                ))}
              </div>
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
