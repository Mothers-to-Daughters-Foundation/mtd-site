import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMatchesByMentorId } from '@/lib/models/Match';
import { getUserById } from '@/lib/models/User';
import styles from './page.module.css';

export const metadata = { title: 'My Mentees | Mentor' };

export default async function MentorMenteesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'mentor' && session.user.role !== 'admin')) {
    redirect('/dashboard');
  }

  const matches = await getMatchesByMentorId(session.user.id);
  const withDetails = await Promise.all(
    matches.map(async (m) => ({
      match: m,
      mentee: await getUserById(m.menteeId),
    }))
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>My Mentees</h1>
        <p className={styles.subtitle}>{matches.length} total match(es)</p>
      </div>

      {withDetails.length === 0 ? (
        <div className={styles.empty}>
          No mentees assigned yet. An admin will pair you with mentees.
        </div>
      ) : (
        <div className={styles.list}>
          {withDetails.map(({ match, mentee }) => {
            if (!mentee) return null;
            return (
              <div key={match._id?.toString()} className={styles.card}>
                <div className={styles.avatar}>{mentee.name.charAt(0).toUpperCase()}</div>
                <div className={styles.info}>
                  <div className={styles.name}>{mentee.name}</div>
                  <div className={styles.email}>{mentee.email}</div>
                  {mentee.profile?.bio && (
                    <div className={styles.bio}>{mentee.profile.bio}</div>
                  )}
                  {mentee.profile?.phone && (
                    <div className={styles.detail}>📞 {mentee.profile.phone}</div>
                  )}
                  {mentee.profile?.location && (
                    <div className={styles.detail}>📍 {mentee.profile.location}</div>
                  )}
                </div>
                <div className={styles.meta}>
                  <span className={`${styles.badge} ${styles[`badge-${match.status}`]}`}>
                    {match.status}
                  </span>
                  {match.startDate && (
                    <div className={styles.date}>
                      Since {new Date(match.startDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
