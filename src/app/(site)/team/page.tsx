import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the leadership team behind Mothers to Daughters.',
};

export default function TeamPage() {
  // Team data - will be migrated from Wix during content migration
  const teamMembers = [
    {
      name: 'Team Member Name',
      role: 'Role Title',
      bio: 'Short bio will be added during content migration.',
      image: '/images/team/placeholder.jpg',
    },
    // Add more team members here
  ];

  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.header}>
          <h1>Our Team</h1>
          <p className={styles.intro}>
            Meet the passionate leaders and mentors who make Mothers to Daughters
            possible.
          </p>
        </div>

        {teamMembers.length === 0 ? (
          <div className={styles.placeholder}>
            <p>Team member information will be added during content migration.</p>
          </div>
        ) : (
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <Card key={index} className={styles.teamCard}>
                <div className={styles.imageContainer}>
                  {/* Image will be added during migration */}
                  <div className={styles.imagePlaceholder}>
                    <span>Photo</span>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3>{member.name}</h3>
                  <p className={styles.role}>{member.role}</p>
                  <p className={styles.bio}>{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
