import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllMatches } from '@/lib/models/Match';
import { getAllUsers } from '@/lib/models/User';
import MatchManager from '@/components/dashboard/MatchManager';
import styles from './page.module.css';

export const metadata = { title: 'Matches | Admin' };

export default async function AdminMatchesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/dashboard');

  const [matches, users] = await Promise.all([getAllMatches(), getAllUsers()]);

  const mentors = users
    .filter((u) => u.role === 'mentor')
    .map((u) => ({ _id: u._id?.toString() ?? '', name: u.name, email: u.email }));

  const mentees = users
    .filter((u) => u.role === 'mentee')
    .map((u) => ({ _id: u._id?.toString() ?? '', name: u.name, email: u.email }));

  const serializedMatches = matches.map((m) => ({
    ...m,
    _id: m._id?.toString() ?? '',
    startDate: m.startDate?.toISOString(),
    endDate: m.endDate?.toISOString(),
    createdAt: m.createdAt?.toISOString() ?? '',
    updatedAt: m.updatedAt?.toISOString() ?? '',
  }));

  // Build user lookup map for display
  const userMap = Object.fromEntries(
    users.map((u) => [
      u._id?.toString() ?? '',
      { _id: u._id?.toString() ?? '', name: u.name, email: u.email },
    ])
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Mentor — Mentee Matches</h1>
        <p className={styles.subtitle}>
          Assign mentors to mentees and track the status of each relationship.
        </p>
      </div>
      <MatchManager
        matches={serializedMatches}
        mentors={mentors}
        mentees={mentees}
        userMap={userMap}
      />
    </div>
  );
}
