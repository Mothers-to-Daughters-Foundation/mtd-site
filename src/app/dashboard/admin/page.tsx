import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LogoutButton from '@/components/LogoutButton';
import styles from './page.module.css';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <>
      <Section spacing="lg" className={styles.header}>
        <Container>
          <div className={styles.headerContent}>
            <div>
              <h1>Admin Dashboard</h1>
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
              <h2>User Management</h2>
              <p>Manage users, roles, and permissions.</p>
              <Button href="/dashboard/admin/users" variant="primary" size="md">
                Manage Users
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Subscriptions</h2>
              <p>View and manage user subscriptions.</p>
              <Button href="/dashboard/admin/subscriptions" variant="primary" size="md">
                View Subscriptions
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Payments</h2>
              <p>Track payments and transactions.</p>
              <Button href="/dashboard/admin/payments" variant="primary" size="md">
                View Payments
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Mentor-Mentee Relationships</h2>
              <p>Manage mentor and mentee pairings.</p>
              <Button href="/dashboard/admin/relationships" variant="primary" size="md">
                Manage Relationships
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Training Materials</h2>
              <p>Create and manage training content.</p>
              <Button href="/dashboard/admin/materials" variant="primary" size="md">
                Manage Materials
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Badges</h2>
              <p>Create and manage achievement badges.</p>
              <Button href="/dashboard/admin/badges" variant="secondary" size="md">
                Manage Badges
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Analytics</h2>
              <p>View platform analytics and reports.</p>
              <Button href="/dashboard/admin/analytics" variant="secondary" size="md">
                View Analytics
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Settings</h2>
              <p>Configure platform settings.</p>
              <Button href="/dashboard/admin/settings" variant="secondary" size="md">
                Settings
              </Button>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
