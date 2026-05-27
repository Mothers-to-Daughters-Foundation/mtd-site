import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/models/User';
import { getMatchByMenteeId } from '@/lib/models/Match';
import { getSubscriptionByUserId } from '@/lib/models/Subscription';
import { getTierById } from '@/lib/models/SubscriptionTier';
import styles from './page.module.css';

export const metadata = { title: 'Mentee Dashboard' };

export default async function MenteeOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'mentee' && session.user.role !== 'admin')) {
    redirect('/dashboard');
  }

  const [match, subscription] = await Promise.all([
    getMatchByMenteeId(session.user.id),
    getSubscriptionByUserId(session.user.id),
  ]);

  const mentor = match ? await getUserById(match.mentorId) : null;
  const tier = subscription ? await getTierById(subscription.tierId) : null;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {session.user.name}</h1>
        <p className={styles.subtitle}>Your mentee dashboard</p>
      </div>

      <div className={styles.grid}>
        {/* Subscription status card */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>Subscription</div>
          {subscription && subscription.status !== 'cancelled' ? (
            <>
              <div className={styles.cardValue}>{tier?.name ?? 'Active'}</div>
              <div className={`${styles.badge} ${styles[`badge-${subscription.status}`]}`}>
                {subscription.status}
              </div>
              {subscription.currentPeriodEnd && (
                <div className={styles.cardMeta}>
                  Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.cardValue}>No active plan</div>
              <a href="/dashboard/mentee/subscription" className={styles.ctaLink}>
                Choose a plan →
              </a>
            </>
          )}
        </div>

        {/* Mentor card */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>Your Mentor</div>
          {mentor ? (
            <>
              <div className={styles.mentorAvatar}>
                {mentor.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.mentorName}>{mentor.name}</div>
              <div className={styles.mentorEmail}>{mentor.email}</div>
              {mentor.profile?.expertise && (
                <div className={styles.cardMeta}>
                  Expertise: {mentor.profile.expertise}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.cardValue}>Not assigned yet</div>
              <div className={styles.cardMeta}>
                An administrator will assign a mentor to you soon.
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.quickLinks}>
        <a href="/dashboard/mentee/profile" className={styles.quickLink}>
          <span>✏️</span> Update Profile
        </a>
        <a href="/dashboard/mentee/subscription" className={styles.quickLink}>
          <span>💳</span> Manage Subscription
        </a>
      </div>
    </div>
  );
}
