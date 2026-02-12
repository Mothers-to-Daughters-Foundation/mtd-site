import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LogoutButton from '@/components/LogoutButton';
import styles from './page.module.css';

export default async function DonorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'donor' && userRole !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <>
      <Section spacing="lg" className={styles.header}>
        <Container>
          <div className={styles.headerContent}>
            <div>
              <h1>Donor Portal</h1>
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
              <h2>Donation History</h2>
              <p>View your past donations and receipts.</p>
              <Button href="/dashboard/donor/history" variant="primary" size="md">
                View History
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Impact</h2>
              <p>See the impact of your contributions.</p>
              <Button href="/dashboard/donor/impact" variant="primary" size="md">
                View Impact
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Make a Donation</h2>
              <p>Support our mission with a new donation.</p>
              <Button href="/donate" variant="primary" size="md">
                Donate Now
              </Button>
            </Card>

            <Card className={styles.card}>
              <h2>Profile Settings</h2>
              <p>Manage your account and preferences.</p>
              <Button href="/dashboard/donor/profile" variant="secondary" size="md">
                Manage Profile
              </Button>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
