import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMatchesByMentorId } from '@/lib/models/Match';
import { getUserById } from '@/lib/models/User';
import StatCard from '@/components/dashboard/StatCard';
import styles from './page.module.css';

export const metadata = { title: 'Mentor Dashboard' };

export default async function MentorOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'mentor' && session.user.role !== 'admin')) {
    redirect('/dashboard');
  }

  const matches = await getMatchesByMentorId(session.user.id);
  const activeMentees = matches.filter((m) => m.status === 'active');

  // Fetch mentee details
  const menteeDetails = await Promise.all(
    activeMentees.map((m) => getUserById(m.menteeId))
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {session.user.name}</h1>
        <p className={styles.subtitle}>Your mentor dashboard</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Active Mentees" value={activeMentees.length} accent />
        <StatCard label="Total Matches" value={matches.length} />
        <StatCard
          label="Pending Matches"
          value={matches.filter((m) => m.status === 'pending').length}
        />
      </div>

      {activeMentees.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Active Mentees</h2>
          <div className={styles.menteeGrid}>
            {activeMentees.map((match, i) => {
              const mentee = menteeDetails[i];
              if (!mentee) return null;
              return (
                <div key={match._id} className={styles.menteeCard}>
                  <div className={styles.menteeAvatar}>
                    {mentee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.menteeName}>{mentee.name}</div>
                    <div className={styles.menteeEmail}>{mentee.email}</div>
                    {mentee.profile?.location && (
                      <div className={styles.menteeDetail}>{mentee.profile.location}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeMentees.length === 0 && (
        <div className={styles.empty}>
          <p>You don&apos;t have any active mentees yet. An administrator will assign mentees to you.</p>
          <a href="/dashboard/mentor/mentees" className={styles.link}>
            View all matches →
          </a>
        </div>
      )}
    </div>
  );
}
