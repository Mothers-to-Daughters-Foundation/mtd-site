'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Tier {
  _id: string;
  name: string;
  description: string;
  pricePerMonth: number;
  features: string[];
  isActive: boolean;
  zeffyUrl?: string;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  expires_at?: string | null;
}

export default function MenteeSubscriptionPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    const load = async () => {
      const [tiersRes, subRes] = await Promise.all([
        fetch('/api/subscriptions/plans'),
        fetch('/api/subscriptions/me'),
      ]);
      const tiersData: Tier[] = tiersRes.ok ? await tiersRes.json() : [];
      const subJson = subRes.ok ? await subRes.json() : null;
      const subscription: Subscription | null = subJson?.subscription ?? null;
      setTiers(tiersData.filter((t) => t.isActive));
      setSub(subscription);
      if (subscription) {
        setCurrentTier(
          tiersData.find((t) => t._id === subscription.plan_id) ?? null
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSubscribe = async (tierId: string) => {
    setActionMsg('');
    const res = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tierId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionType('error');
      setActionMsg(data.error ?? 'Failed to start checkout');
      return;
    }
    if (data.zeffyUrl) {
      window.open(data.zeffyUrl, '_blank');
    } else if (data.url) {
      window.location.href = data.url;
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    const res = await fetch('/api/subscriptions/cancel', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      setActionType('error');
      setActionMsg(data.error ?? 'Failed to cancel');
    } else {
      setActionType('success');
      setActionMsg('Subscription cancelled.');
      setSub((s) => s ? { ...s, status: 'cancelled' } : s);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading subscription info…</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Subscription</h1>
        <p className={styles.subtitle}>Manage your membership plan</p>
      </div>

      {actionMsg && (
        <div className={`${styles.alert} ${styles[`alert-${actionType}`]}`}>
          {actionMsg}
        </div>
      )}

      {sub && sub.status !== 'cancelled' && currentTier && (
        <div className={styles.currentPlan}>
          <div className={styles.currentLabel}>Current Plan</div>
          <div className={styles.currentName}>{currentTier.name}</div>
          <div className={styles.currentPrice}>${(currentTier.pricePerMonth / 100).toFixed(2)}/mo</div>
          <span className={`${styles.badge} ${styles[`badge-${sub.status}`]}`}>
            {sub.status}
          </span>
          {sub.expires_at && (
            <div className={styles.renewDate}>
              Renews {new Date(sub.expires_at).toLocaleDateString()}
            </div>
          )}
          <button onClick={handleCancel} className={styles.cancelBtn}>
            Cancel Subscription
          </button>
        </div>
      )}

      <div className={styles.sectionTitle}>Available Plans</div>
      <div className={styles.tiersGrid}>
        {tiers.map((tier) => {
          const isCurrent = sub?.plan_id === tier._id && sub.status !== 'cancelled';
          return (
            <div key={tier._id} className={`${styles.tierCard} ${isCurrent ? styles.tierCardActive : ''}`}>
              {isCurrent && <div className={styles.currentBadge}>Current</div>}
              <div className={styles.tierName}>{tier.name}</div>
              <div className={styles.tierPrice}>${(tier.pricePerMonth / 100).toFixed(2)}<span>/mo</span></div>
              {tier.description && (
                <p className={styles.tierDesc}>{tier.description}</p>
              )}
              {tier.features.length > 0 && (
                <ul className={styles.featureList}>
                  {tier.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
              )}
              {!isCurrent && (
                <button
                  onClick={() => handleSubscribe(tier._id)}
                  className={styles.subscribeBtn}
                >
                  {tier.zeffyUrl ? 'Donate via Zeffy' : 'Subscribe'}
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
