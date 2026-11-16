import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import ImpactStories from '@/components/marketing/ImpactStories';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Mothers to Daughters is a global movement dedicated to forging deep connections, amplifying voices, and driving meaningful action.',
};

const values = [
  {
    number: '01',
    title: 'Radical Inclusion & Trust',
    description:
      'We create spaces where every woman is seen, heard, and valued. By embracing diverse voices and building authentic connections, we cultivate mentorship that drives real change.',
  },
  {
    number: '02',
    title: 'Excellence & Impact',
    description:
      'We hold ourselves to the highest standards, ensuring that our work leaves a lasting legacy. Through strategic mentorship and leadership development, we create ripples of change that uplift entire communities.',
  },
  {
    number: '03',
    title: 'Collective Empowerment',
    description:
      'We thrive together. By connecting generations through shared wisdom and mutual support, we create opportunities for every woman to grow, lead, and rise.',
  },
  {
    number: '04',
    title: 'Fearless Innovation',
    description:
      "We challenge the status quo with bold ideas and creative solutions. Progress happens where courage meets action, breaking barriers and redefining what's possible for women everywhere.",
  },
];

const milestones = [
  {
    date: 'March 2020',
    text: 'Mothers to Daughters (M2D) was born, a vibrant community where women come together to uplift, mentor, and empower one another.',
  },
  {
    date: 'January 2021',
    text: 'A new chapter began as M2D was officially incorporated as a not-for-profit, laying the foundation for long-term impact with the establishment of our dedicated board.',
  },
  {
    date: 'June 2022',
    text: 'We proudly launched our flagship mentorship programs, Legacy Building Apprenticeship & Guiding Lights, designed to cultivate leadership, resilience, and intergenerational wisdom.',
  },
  {
    date: 'March 2023',
    text: 'Connection and collaboration took center stage as we hosted our first networking event in partnership with 6ix Academy, fostering meaningful relationships and professional growth.',
  },
  {
    date: 'November 2024',
    text: 'M2D was officially granted 501(c)(3) status in the United States, expanding our ability to serve and support women globally.',
  },
  {
    date: 'March 2025',
    text: "M2D marks its 5th anniversary with a bold presence on billboards at Toronto's Dundas Square and Exhibition Place, showcasing our unwavering commitment to empowering women worldwide.",
  },
];

/** Small decorative butterfly, echoing the logo (the live page uses butterfly accents). */
function Butterfly({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden="true" focusable="false">
      <path
        d="M32 24c-4-10-14-20-24-18C1 8 2 18 10 22c-8 4-7 14 2 16 8 2 16-6 20-14zm0 0c4-10 14-20 24-18 7 2 6 12-2 16 8 4 7 14-2 16-8 2-16-6-20-14z"
        fill="currentColor"
      />
      <path d="M32 14v22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <Section spacing="lg" className={styles.intro}>
        <Container>
          <div className={styles.introGrid}>
            <div className={styles.introText}>
              <h1 className={styles.introTitle}>About Us.</h1>
              <p>
                Mothers to Daughters is a <strong>global movement</strong> dedicated to forging deep
                connections, amplifying voices, and driving meaningful action. By cultivating
                relationships that transcend generations, cultures, and communities, we create a
                powerful network of women uplifting one another.
              </p>
              <p className={styles.belief}>
                We believe that <strong>society thrives when women are elevated</strong> to the
                heights they&rsquo;ve always deserved, leading, innovating, and shaping the future.
              </p>
              <p>
                Strengthened by resilience, creativity, and collective wisdom, women are essential
                to building a more inclusive and equitable world. Through mentorship, leadership,
                and shared insights, we empower them to{' '}
                <strong>break barriers, drive change, and leave a lasting impact</strong>. Yet every
                day, the brilliance and potential of women remain overlooked, held back by{' '}
                <strong>systemic inequities</strong> and societal pressures. When women are excluded
                from opportunities to lead, innovate, and create, we all miss out on the{' '}
                <strong>sustainable solutions</strong> and transformative ideas they bring to the
                table. It&rsquo;s time to{' '}
                <strong>
                  unlock their power, honor their contributions, and ensure their voices shape the
                  future
                </strong>
                .
              </p>

              <aside className={styles.note}>
                <h2>Please Note:</h2>
                <p>
                  Mothers to Daughters is a non-profit organization recognized as tax-exempt under
                  Section 501(c)(3) of the Internal Revenue Code. Contributions to Mothers to
                  Daughters are tax-deductible to the fullest extent allowed by law.
                </p>
              </aside>
            </div>

            <div className={styles.introImage}>
              <span className={styles.introBlock} aria-hidden="true" />
              <Image
                src={getImagePath('/images/about/about-hero.png')}
                alt="Generational mentorship and connection"
                width={600}
                height={1067}
                className={styles.introImageContent}
                priority
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className={styles.valuesSection}>
        <Container>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            {values.map((value, i) => (
              <div
                key={value.title}
                className={`${styles.valueCard} ${i === 1 || i === 2 ? styles.valueCardFilled : ''}`}
              >
                <h3>
                  <span className={styles.valueNumber}>{value.number}</span>
                  {value.title}
                </h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <h2 className={styles.sectionTitle}>
            Our Journey: Empowering Women, One Milestone at a Time
          </h2>
          <ol className={styles.journeyGrid}>
            {milestones.map((milestone, i) => {
              const latest = i === milestones.length - 1;
              return (
                <li
                  key={milestone.date}
                  className={`${styles.milestone} ${latest ? styles.milestoneLatest : ''}`}
                >
                  <h3 className={styles.milestoneDate}>{milestone.date}</h3>
                  <p>{milestone.text}</p>
                  <Butterfly className={latest ? styles.butterflyLatest : styles.butterfly} />
                </li>
              );
            })}
          </ol>
        </Container>
      </Section>

      <ImpactStories tone="brand" />
    </>
  );
}
