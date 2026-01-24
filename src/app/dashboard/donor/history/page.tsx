import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './page.module.css';

export default async function DonorHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <Section spacing="lg">
      <Container>
        <h1>Donation History</h1>
        <p>Donation history page coming soon.</p>
      </Container>
    </Section>
  );
}
