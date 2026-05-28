import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllUsers } from '@/lib/models/User';
import { getAllTiers } from '@/lib/models/SubscriptionTier';
import { getAllSubscriptions } from '@/lib/models/Subscription';
import { getAllMatches } from '@/lib/models/Match';
import StatCard from '@/components/dashboard/StatCard';
import styles from './page.module.css';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/dashboard');

  const [users, tiers, subscriptions, matches] = await Promise.all([
    getAllUsers(),
    getAllTiers(),
    getAllSubscriptions(),
    getAllMatches(),
  ]);

  const mentors = users.filter((u) => u.role === 'mentor');
  const mentees = users.filter((u) => u.role === 'mentee');
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const activeMatches = matches.filter((m) => m.status === 'active');

  // Monthly Recurring Revenue
  const mrr = activeSubs.reduce((sum, sub) => {
    const tier = tiers.find((t) => t._id === sub.tierId);
    return sum + (tier?.pricePerMonth ?? 0);
  }, 0);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Overview of platform activity</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Mentors" value={mentors.length} />
        <StatCard label="Mentees" value={mentees.length} />
        <StatCard
          label="Monthly Revenue"
          value={`$${(mrr / 100).toFixed(2)}`}
          accent
        />
        <StatCard label="Active Subscriptions" value={activeSubs.length} />
        <StatCard label="Active Matches" value={activeMatches.length} />
        <StatCard label="Subscription Tiers" value={tiers.filter((t) => t.isActive).length} />
      </div>

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actions}>
          <a href="/dashboard/admin/users" className={styles.actionCard}>
            <span className={styles.actionTitle}>Manage Users</span>
            <span className={styles.actionDesc}>View, edit roles and subscriptions</span>
          </a>
          <a href="/dashboard/admin/tiers" className={styles.actionCard}>
            <span className={styles.actionTitle}>Subscription Tiers</span>
            <span className={styles.actionDesc}>Create and edit pricing tiers</span>
          </a>
          <a href="/dashboard/admin/matches" className={styles.actionCard}>
            <span className={styles.actionTitle}>Matches</span>
            <span className={styles.actionDesc}>Assign mentors to mentees</span>
          </a>
          <a href="/dashboard/admin/subscriptions" className={styles.actionCard}>
            <span className={styles.actionTitle}>Subscriptions</span>
            <span className={styles.actionDesc}>Review all subscription records</span>
          </a>
        </div>
      </div>
    </div>
  );
}
