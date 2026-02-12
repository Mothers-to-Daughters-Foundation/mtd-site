import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LogoutButton from '@/components/LogoutButton';
import styles from './page.module.css';

export default async function MenteeDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'mentee' && userRole !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <>
      <Section spacing="lg" className={styles.header}>
        <Container>
          <div className={styles.headerContent}>
            <div>
              <h1>Mentee Dashboard</h1>
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
              <h2>My Progress</h2>
              <p>Track your learning journey and achievements.</p>
              <Button href="/dashboard/mentee/progress" variant="primary" size="md">
                View Progress
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Training Materials</h2>
              <p>Access courses, videos, and learning resources.</p>
              <Button href="/dashboard/mentee/materials" variant="primary" size="md">
                View Materials
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>My Mentors</h2>
              <p>Connect with your assigned mentors.</p>
              <Button href="/dashboard/mentee/mentors" variant="primary" size="md">
                View Mentors
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Sessions</h2>
              <p>Schedule and manage mentorship sessions.</p>
              <Button href="/dashboard/mentee/sessions" variant="primary" size="md">
                View Sessions
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>My Badges</h2>
              <p>View badges and achievements earned.</p>
              <Button href="/dashboard/mentee/badges" variant="secondary" size="md">
                View Badges
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Profile Settings</h2>
              <p>Manage your profile and preferences.</p>
              <Button href="/dashboard/mentee/profile" variant="secondary" size="md">
                Manage Profile
              </Button>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
