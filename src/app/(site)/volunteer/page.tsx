import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import VolunteerForm from '@/components/forms/VolunteerForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Volunteer',
  description:
    'Give your time and talent to Mothers to Daughters and help empower women across generations.',
};

const opportunities = [
  {
    title: 'Mentorship Support',
    description:
      'Help facilitate our intergenerational mentoring cohorts—matching pairs, checking in, and keeping the experience meaningful for everyone.',
  },
  {
    title: 'Events & Mixers',
    description:
      'Lend a hand planning and running our Mentors Mixers and community gatherings, from logistics to welcoming guests on the day.',
  },
  {
    title: 'Content & Storytelling',
    description:
      'Write, design, photograph, or film. Help us capture impact stories and share them across our blog and social channels.',
  },
  {
    title: 'Operations & Outreach',
    description:
      'Support fundraising, partner outreach, and the behind-the-scenes work that keeps our programs running and growing.',
  },
];

export default function VolunteerPage() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Volunteer With Us</h1>
          <p className={styles.heroDescription}>
            Our work is powered by people who show up for one another. Give your
            time and talent, and help empower women across generations.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.intro}>
            <h2>Why Join Mothers to Daughters?</h2>
            <p>
              At Mothers to Daughters (M2D), we’re more than an
              organization—we’re a movement dedicated to empowering young women
              through mentorship, leadership, and lifelong connections. We
              strive to create a nurturing, inclusive and safe space where women
              across generations grow, lead, and uplift one another.
            </p>
            <p>
              Joining M2D as a volunteer, means becoming part of a passionate,
              purpose-driven team that fosters impactful change. Here, your
              efforts will translate into a chance to build meaningful programs,
              drive lasting partnerships, shape a better tomorrow, and leave a
              lasting impact on women and society as a whole.
            </p>
            <p>
              <strong>Be part of something bigger. Be part of M2D.</strong>
            </p>
          </div>

          <div className={styles.opportunities}>
            <h2 className={styles.sectionTitle}>Ways to Get Involved</h2>
            <div className={styles.grid}>
              {opportunities.map((item) => (
                <div key={item.title} className={styles.card}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Ready to Start?</h2>
            <p className={styles.formIntro}>
              Fill out the form below and our team will be in touch about
              opportunities that match your interests.
            </p>
            <VolunteerForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
