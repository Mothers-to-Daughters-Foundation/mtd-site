import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mentors Mixer 3.0 — Women As a Powerful Force',
  description:
    'A look back at Mentors Mixer 3.0: "Women As a Powerful Force" — March 29th, 2023.',
};

const speakers = [
  { name: 'Anna Lolomari', role: 'Zesty Lifestyle' },
  { name: 'Beckie Di Leo', role: 'HeARTs Dept' },
  { name: 'Tamara Bahry', role: 'Documentary & Studio Photographer' },
  { name: 'Dimitra Davidson', role: 'Indeed Labs' },
  { name: 'Klaudia Zinaty', role: 'Women Empowerment Awards' },
  { name: 'Aynur Jahan', role: 'NOORÈLLE Jewelry' },
  { name: 'Claudia Chan', role: 'Mindset Life Coach' },
  { name: 'Lisa Ventura', role: '1st Link Group' },
];

const gallery = [1, 2, 3, 4, 5, 6].map((n) => `/images/mixers/mixer-3-0-gallery-${n}.jpg`);

export default function MentorsMixer30Page() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Mentors Mixer 3.0</h1>
          <p className={styles.heroDescription}>
            &ldquo;Women As a Powerful Force&rdquo; &middot; March 29th, 2023
          </p>
        </Container>
      </Section>

      <Section spacing="none">
        <Container>
          <div className={styles.heroImage}>
            <Image
              src={getImagePath('/images/mixers/mixer-3-0-hero.png')}
              alt="Mentors Mixer 3.0 — Women As a Powerful Force"
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
              <h2>Event Recap</h2>
              <p>
                Mentors Mixer 3.0 celebrated women and gender equity, bringing
                together a powerhouse of mentors and changemakers. As founder
                Francine Mbvoumbo put it: &ldquo;Women are a powerful force and
                gender equity is a winning bet today and tomorrow.&rdquo;
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

            <div className={styles.section}>
              <h2>Event Gallery</h2>
              <div className={styles.gallery}>
                {gallery.map((src, i) => (
                  <div key={src} className={styles.galleryItem}>
                    <Image
                      src={getImagePath(src)}
                      alt={`Mentors Mixer 3.0 photo ${i + 1}`}
                      width={900}
                      height={675}
                      className={styles.galleryImage}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
