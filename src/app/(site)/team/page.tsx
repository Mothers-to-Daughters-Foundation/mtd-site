import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Our Team',
  description:
    'Meet the leadership, advisors, and changemakers behind Mothers to Daughters.',
};

type Member = {
  name: string;
  role: string;
  location?: string;
};

type TeamGroup = {
  title: string;
  members: Member[];
};

const groups: TeamGroup[] = [
  {
    title: 'Executive Governance Board',
    members: [
      { name: 'Francine Mbvoumbo', role: 'Chair & President' },
      { name: 'Cara-Lee Lewis', role: 'Vice-Chair' },
      { name: 'Michelle Cooper', role: 'Treasurer' },
      { name: 'Peter Frank', role: 'Senior Advisor, U.S. Affairs' },
    ],
  },
  {
    title: 'Executive Team',
    members: [
      { name: 'Alexis Prieto', role: 'HR Strategy & Member Experience' },
      { name: 'Sandra Banuett', role: 'Director, Program Delivery & Impact' },
    ],
  },
  {
    title: 'Advisory Council',
    members: [
      { name: 'Dr. Sindy Zemura', role: 'Special Advisor, Global Affairs' },
      { name: 'Mel Romolo', role: 'Advisor to the Chair' },
      { name: 'Shefa Rezbana', role: 'Strategic Communications & Impact Advisor' },
      { name: 'Moureen Ambalwa', role: 'Consultant, Global Expansion' },
    ],
  },
  {
    title: 'Youth Leadership Council',
    members: [
      { name: 'Pornpiseth Semson', role: 'Youth Leader', location: 'Thailand' },
      { name: 'Favoured-Joy Oghenekome', role: 'Youth Leader', location: 'Nigeria' },
      { name: 'Vitalina Shevchenko', role: 'Youth Leader', location: 'Ukraine' },
      { name: 'Rida', role: 'Youth Leader', location: 'Pakistan' },
      { name: 'Iliana Mejia', role: 'Youth Leader', location: 'Dominican Republic' },
      { name: 'Maya Nasiriahmadabadi', role: 'Youth Leader', location: 'Iran' },
    ],
  },
  {
    title: 'Core Team',
    members: [
      { name: 'Lan Nguyen', role: 'Digital Marketing & Social Media Specialist' },
      { name: 'Adeola Adesoba', role: 'Events & Social Impact Leader' },
      { name: 'Solomon Umoh', role: 'Web Developer & SEO Expert' },
      { name: 'Ayo Ogunrinde', role: 'Content Creator' },
      { name: 'Leena Jorgenson', role: 'Content Creator' },
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
              {group.members.map((member) => (
                <Card key={member.name} className={styles.teamCard}>
                  <div className={styles.imageContainer}>
                    <div className={styles.imagePlaceholder}>
                      <span>{initials(member.name)}</span>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3>{member.name}</h3>
                    <p className={styles.role}>{member.role}</p>
                    {member.location && (
                      <p className={styles.location}>{member.location}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </Container>
    </Section>
  );
}
