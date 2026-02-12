import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;

  // Redirect to role-specific dashboard
  if (userRole === 'mentor') {
    redirect('/dashboard/mentor');
  } else if (userRole === 'mentee') {
    redirect('/dashboard/mentee');
  } else if (userRole === 'donor') {
    redirect('/dashboard/donor');
  } else if (userRole === 'admin') {
    redirect('/dashboard/admin');
  }

  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.dashboard}>
          <h1>Dashboard</h1>
          <p>Welcome, {session.user?.name}!</p>
        </div>
      </Container>
    </Section>
  );
}
