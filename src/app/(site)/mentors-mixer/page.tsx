import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mentors Mixer',
  description:
    'Mentor Mixers is a dynamic networking event designed to connect aspiring professionals with experienced mentors in their industry.',
};

const mixers = [
  {
    title: 'Mentors Mixer 4.0',
    theme: 'Rebels with a Cause',
    href: '/mentors-mixer/4.0',
    image: '/images/mentors-mixer/mixer-4-0.png',
    alt: 'Guests connecting at Mentors Mixer 4.0',
  },
  {
    title: 'Mentors Mixer 3.0',
    theme: 'Women As a Powerful Force',
    href: '/mentors-mixer/3.0',
    image: '/images/mentors-mixer/mixer-3-0.png',
    alt: 'Speakers and guests at Mentors Mixer 3.0',
  },
];

export default function MentorsMixerPage() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Mentors Mixer</h1>
          <p className={styles.heroDescription}>
            Mentor Mixers is a dynamic networking event designed to connect
            aspiring professionals with experienced mentors in their industry.
            These events provide a casual yet impactful environment where
            attendees can engage in meaningful conversations, seek career
            guidance, and expand their professional networks. Whether you&apos;re
            looking for advice, inspiration, or new opportunities, Mentor Mixers
            create the perfect space to foster valuable connections and growth.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.mixerGrid}>
            {mixers.map((mixer) => (
              <article key={mixer.href} className={styles.mixerCard}>
                <Image
                  src={getImagePath(mixer.image)}
                  alt={mixer.alt}
                  width={480}
                  height={218}
                  className={styles.mixerImage}
                />
                <div className={styles.mixerBody}>
                  <h2>{mixer.title}</h2>
                  <p>{mixer.theme}</p>
                  <Button href={mixer.href} variant="primary" size="md">
                    Read More
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
