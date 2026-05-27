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
  _id: string;
  tierId: string;
  status: string;
  paymentProvider: string;
  currentPeriodEnd?: string;
  billingHistory: { date: string; amount: number; description: string; status: string }[];
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
        fetch('/api/admin/tiers'),
        fetch('/api/subscriptions/me'),
      ]);
      const tiersData = tiersRes.ok ? await tiersRes.json() : [];
      const subData = subRes.ok ? await subRes.json() : null;
      setTiers(tiersData.filter((t: Tier) => t.isActive));
      setSub(subData);
      if (subData) {
        setCurrentTier(tiersData.find((t: Tier) => t._id === subData.tierId) ?? null);
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
          {sub.currentPeriodEnd && (
            <div className={styles.renewDate}>
              Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
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
          const isCurrent = sub?.tierId === tier._id && sub.status !== 'cancelled';
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

      {sub && sub.billingHistory && sub.billingHistory.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.sectionTitle}>Billing History</div>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sub.billingHistory.map((entry, i) => (
                <tr key={i}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.description}</td>
                  <td>${entry.amount.toFixed(2)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge-${entry.status}`]}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
