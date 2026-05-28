import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllTiers } from '@/lib/models/SubscriptionTier';
import TierEditor from '@/components/dashboard/TierEditor';
import styles from './page.module.css';

export const metadata = { title: 'Subscription Tiers | Admin' };

export default async function AdminTiersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/dashboard');

  const tiers = await getAllTiers();
  const serialized = tiers.map((t) => ({
    ...t,
    _id: t._id?.toString() ?? '',
    createdAt: t.createdAt?.toISOString() ?? '',
    updatedAt: t.updatedAt?.toISOString() ?? '',
  }));

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Subscription Tiers</h1>
        <p className={styles.subtitle}>
          Create and edit pricing tiers. Changes take effect immediately.
        </p>
      </div>
      <TierEditor tiers={serialized} />
    </div>
  );
}
