import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { getTeamBioSlugs } from '@/lib/team';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Our Team',
  description:
    'Meet the leadership, advisors, and changemakers behind Mothers to Daughters.',
};

type Member = {
  /** Matches content/team/<slug>.md; the card links to /team/<slug> when that file exists. */
  slug?: string;
  name: string;
  role: string;
  location?: string;
  image?: string;
};

type TeamGroup = {
  title: string;
  members: Member[];
};

const groups: TeamGroup[] = [
  {
    title: 'Executive Governance Board',
    members: [
      { slug: 'francine-mbvoumbo', name: 'Francine Mbvoumbo', role: 'Chair & President', image: '/images/team/francine-mbvoumbo.jpg' },
      { slug: 'cara-lee-lewis', name: 'Cara-Lee Lewis', role: 'Vice-Chair', image: '/images/team/cara-lee-lewis.png' },
      { slug: 'michelle-cooper', name: 'Michelle Cooper', role: 'Treasurer', image: '/images/team/michelle-cooper.webp' },
      { slug: 'peter-frank', name: 'Peter Frank', role: 'Senior Advisor, U.S. Affairs', image: '/images/team/peter-frank.png' },
    ],
  },
  {
    title: 'Executive Team',
    members: [
      { slug: 'alexis-prieto', name: 'Alexis Prieto', role: 'HR Strategy & Member Experience', image: '/images/team/alexis-prieto.png' },
      { slug: 'sandra-banuett', name: 'Sandra Banuett', role: 'Director, Program Delivery & Impact', image: '/images/team/sandra-banuett.jpg' },
    ],
  },
  {
    title: 'Advisory Council',
    members: [
      { slug: 'sindy-zemura', name: 'Dr. Sindy Zemura', role: 'Special Advisor, Global Affairs', image: '/images/team/sindy-zemura.jpg' },
      { slug: 'mel-romolo', name: 'Mel Romolo', role: 'Advisor to the Chair', image: '/images/team/mel-romolo.jpg' },
      { slug: 'shefa-rezbana', name: 'Shefa Rezbana', role: 'Strategic Communications & Impact Advisor', image: '/images/team/shefa-rezbana.jpg' },
      { slug: 'moureen-ambalwa', name: 'Moureen Ambalwa', role: 'Consultant, Global Expansion', image: '/images/team/moureen-ambalwa.png' },
    ],
  },
  {
    title: 'Youth Leadership Council',
    members: [
      { slug: 'pornpiseth-semson', name: 'Pornpiseth Semson', role: 'Youth Leader', location: 'Thailand', image: '/images/team/pornpiseth-semson.jpg' },
      { slug: 'favoured-joy-oghenekome', name: 'Favoured-Joy Oghenekome', role: 'Youth Leader', location: 'Nigeria', image: '/images/team/favoured-joy-oghenekome.png' },
      { slug: 'vitalina-shevchenko', name: 'Vitalina Shevchenko', role: 'Youth Leader', location: 'Ukraine', image: '/images/team/vitalina-shevchenko.jpg' },
      { slug: 'rida', name: 'Rida', role: 'Youth Leader', location: 'Pakistan', image: '/images/team/rida.jpg' },
      { slug: 'iliana-mejia', name: 'Iliana Mejia', role: 'Youth Leader', location: 'Dominican Republic', image: '/images/team/iliana-mejia.jpg' },
      { slug: 'maya-nasiriahmadabadi', name: 'Maya Nasiriahmadabadi', role: 'Youth Leader', location: 'Iran', image: '/images/team/maya-nasiriahmadabadi.jpg' },
    ],
  },
  {
    title: 'Core Team',
    members: [
      { slug: 'lan-nguyen', name: 'Lan Nguyen', role: 'Digital Marketing & Social Media Specialist', image: '/images/team/lan-nguyen.jpg' },
      { slug: 'adeola-adesoba', name: 'Adeola Adesoba', role: 'Events & Social Impact Leader', image: '/images/team/adeola-adesoba.jpg' },
      { slug: 'solomon-umoh', name: 'Solomon Umoh', role: 'Web Developer & SEO Expert', image: '/images/team/solomon-umoh.png' },
      { slug: 'ayo-ogunrinde', name: 'Ayo Ogunrinde', role: 'Content Creator', image: '/images/team/ayo-ogunrinde.jpg' },
      { name: 'Leena Jorgenson', role: 'Content Creator', image: '/images/team/leena-jorgenson.jpg' },
    ],
  },
  {
    title: 'Advisory Team',
    members: [
      { name: 'Zaynah Marar', role: 'Advisor' },
      { name: 'Loretta Levinson', role: 'Advisor' },
      { name: 'Oumou Samake', role: 'Advisor' },
      { name: 'Ilaria Varoli', role: 'Advisor' },
      { name: 'Shaira Ahmed', role: 'Advisor' },
      { name: 'Cigdem Djamgouz', role: 'Advisor' },
      { name: 'Maitsi Dellacasa', role: 'Advisor' },
    ],
  },
];

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function TeamPage() {
  const bioSlugs = new Set(getTeamBioSlugs());

  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.header}>
          <h1>Our Team</h1>
          <p className={styles.intro}>
            United by purpose, driven by impact. Our team brings together diverse
            backgrounds, experiences, and expertise—but what unites us is a
            shared commitment to empowering women across generations.
          </p>
        </div>

        {groups.map((group) => (
          <div key={group.title} className={styles.group}>
            <h2 className={styles.groupTitle}>{group.title}</h2>
            <div className={styles.teamGrid}>
              {group.members.map((member) => {
                const bioHref =
                  member.slug && bioSlugs.has(member.slug)
                    ? `/team/${member.slug}`
                    : undefined;
                return (
                  <Card
                    key={member.name}
                    className={styles.teamCard}
                    href={bioHref}
                    variant={bioHref ? 'interactive' : 'static'}
                  >
                    <div className={styles.imageContainer}>
                      {member.image ? (
                        <Image
                          src={getImagePath(member.image)}
                          alt={member.name}
                          width={400}
                          height={400}
                          className={styles.memberImage}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <span>{initials(member.name)}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.cardContent}>
                      <h3>{member.name}</h3>
                      <p className={styles.role}>{member.role}</p>
                      {member.location && (
                        <p className={styles.location}>{member.location}</p>
                      )}
                      {bioHref && (
                        <span className={styles.bioLink}>
                          Read bio <span aria-hidden="true">→</span>
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </Container>
    </Section>
  );
}
