import Link from 'next/link';
import type { MenteeAccessReason } from '@/lib/access-rule';
import styles from './LockedFeature.module.css';

const COPY: Record<MenteeAccessReason, string> = {
  ok: '',
  no_subscription: 'Choose a membership plan to unlock this feature.',
  free_tier:
    'This feature is included with the Growth and Premium plans. Upgrade to unlock it.',
  expired: 'Your subscription has expired. Renew it to regain access.',
  cancelled: 'Your subscription was cancelled. Resubscribe to regain access.',
  paused: 'Your subscription is paused. Resume it to regain access.',
};

export default function LockedFeature({
  feature,
  reason,
}: {
  feature: string;
  reason: MenteeAccessReason;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon} aria-hidden="true">🔒</div>
      <h2 className={styles.title}>{feature} is locked</h2>
      <p className={styles.message}>{COPY[reason] || COPY.no_subscription}</p>
      <Link href="/dashboard/mentee/subscription" className={styles.cta}>
        Choose a plan
      </Link>
    </div>
  );
}
