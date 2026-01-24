import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './page.module.css';

export default async function MentorProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <Section spacing="lg">
      <Container>
        <h1>Mentor Profile</h1>
        <p>Profile management page coming soon.</p>
      </Container>
    </Section>
  );
}
