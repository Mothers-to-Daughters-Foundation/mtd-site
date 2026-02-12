import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';
import LogoutButton from '@/components/LogoutButton';

export default async function MentorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'mentor' && userRole !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <>
      <Section spacing="lg" className={styles.header}>
        <Container>
          <div className={styles.headerContent}>
            <div>
              <h1>Mentor Dashboard</h1>
              <p className={styles.welcome}>
                Welcome back, {session.user?.name}!
              </p>
            </div>
            <LogoutButton />
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.dashboardGrid}>
            <Card className={styles.card}>
              <h2>My Profile</h2>
              <p>View and edit your mentor profile information.</p>
              <Button href="/dashboard/mentor/profile" variant="primary" size="md">
                Manage Profile
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>My Mentees</h2>
              <p>View and manage your mentee relationships.</p>
              <Button href="/dashboard/mentor/mentees" variant="primary" size="md">
                View Mentees
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Resources</h2>
              <p>Access mentoring resources and guides.</p>
              <Button href="/dashboard/mentor/resources" variant="secondary" size="md">
                View Resources
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Activity</h2>
              <p>View your mentoring activity and history.</p>
              <Button href="/dashboard/mentor/activity" variant="secondary" size="md">
                View Activity
              </Button>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
