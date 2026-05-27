import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllUsers } from '@/lib/models/User';
import { getAllTiers } from '@/lib/models/SubscriptionTier';
import UserTable from '@/components/dashboard/UserTable';
import styles from './page.module.css';

export const metadata = { title: 'Manage Users | Admin' };

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/dashboard');

  const [users, tiers] = await Promise.all([getAllUsers(), getAllTiers()]);

  const serialized = users.map((u) => ({
    ...u,
    _id: u._id?.toString() ?? '',
    createdAt: u.createdAt?.toISOString() ?? '',
    updatedAt: u.updatedAt?.toISOString() ?? '',
    subscriptionStartDate: u.subscriptionStartDate?.toISOString(),
    subscriptionRenewDate: u.subscriptionRenewDate?.toISOString(),
  }));

  const serializedTiers = tiers.map((t) => ({
    ...t,
    _id: t._id?.toString() ?? '',
  }));

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.subtitle}>{users.length} registered accounts</p>
      </div>
      <UserTable users={serialized} tiers={serializedTiers} />
    </div>
  );
}
