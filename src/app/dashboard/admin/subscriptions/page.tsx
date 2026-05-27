import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllSubscriptions } from '@/lib/models/Subscription';
import { getAllTiers } from '@/lib/models/SubscriptionTier';
import { getAllUsers } from '@/lib/models/User';
import styles from './page.module.css';

export const metadata = { title: 'Subscriptions | Admin' };

export default async function AdminSubscriptionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/dashboard');

  const [subscriptions, tiers, users] = await Promise.all([
    getAllSubscriptions(),
    getAllTiers(),
    getAllUsers(),
  ]);

  const tierMap = Object.fromEntries(tiers.map((t) => [t._id?.toString() ?? '', t]));
  const userMap = Object.fromEntries(
    users.map((u) => [u._id?.toString() ?? '', { name: u.name, email: u.email }])
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Subscriptions</h1>
        <p className={styles.subtitle}>
          {subscriptions.length} total subscription records
        </p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Tier</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Renewal</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const user = userMap[sub.userId];
              const tier = tierMap[sub.tierId];
              return (
                <tr key={sub._id?.toString()}>
                  <td>
                    <div className={styles.userName}>{user?.name ?? sub.userId}</div>
                    <div className={styles.userEmail}>{user?.email}</div>
                  </td>
                  <td>{tier?.name ?? sub.tierId}</td>
                  <td className={styles.capitalize}>{sub.paymentProvider}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge-${sub.status}`]}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    {sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              );
            })}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  No subscriptions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
