'use client';

import { useEffect, useState } from 'react';
import { INTEREST_CATEGORIES } from '@/lib/onboarding-options';
import styles from './onboarding.module.css';

type Plan = {
  _id: string;
  name: string;
  description: string;
  pricePerMonth: number;
  features: string[];
};

export default function OnboardingForm() {
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<string>('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/subscriptions/plans')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Plan[]) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]));
  }, []);

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }
  function addCustomInterest() {
    const v = customInterest.trim();
    if (v && !interests.includes(v)) setInterests((prev) => [...prev, v]);
    setCustomInterest('');
  }
  function addGoal() {
    const v = goalInput.trim();
    if (v && !goals.includes(v)) setGoals((prev) => [...prev, v]);
    setGoalInput('');
  }
  function removeGoal(v: string) {
    setGoals((prev) => prev.filter((g) => g !== v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Enter your name.');
    if (interests.length === 0) return setError('Pick at least one interest.');
    if (goals.length === 0) return setError('Add at least one career goal.');
    if (!planId) return setError('Choose a plan.');

    setSaving(true);
    try {
      const res = await fetch('/api/mentee/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name.trim(), interests, careerGoals: goals, planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSaving(false);
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (data.next === 'checkout') {
        const c = await fetch('/api/subscriptions/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId: data.planId }),
        });
        const cd = await c.json().catch(() => ({}));
        // Checkout returns a Zeffy link ({ zeffyUrl }); fall back to the legacy
        // `url` field just in case, then to the pending page.
        const checkoutUrl = c.ok ? (cd.zeffyUrl ?? cd.url) : null;
        window.location.href =
          checkoutUrl ?? '/dashboard/mentee/subscription?pending=1';
        return;
      }
      window.location.href = '/dashboard/mentee';
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome! Let&apos;s set up your profile</h1>
        <p className={styles.subtitle}>
          Tell us about yourself so we can match you with the right mentor.
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your name</h2>
        <div className={styles.addRow}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your interests</h2>
        <div className={styles.chips}>
          {INTEREST_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`${styles.chip} ${interests.includes(cat) ? styles.chipOn : ''}`}
              onClick={() => toggleInterest(cat)}
              aria-pressed={interests.includes(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={styles.addRow}>
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addCustomInterest(); }
            }}
            placeholder="Add your own…"
          />
          <button type="button" onClick={addCustomInterest}>Add</button>
        </div>
        {interests.filter((i) => !INTEREST_CATEGORIES.includes(i as never)).length > 0 && (
          <div className={styles.chips}>
            {interests
              .filter((i) => !INTEREST_CATEGORIES.includes(i as never))
              .map((i) => (
                <button type="button" key={i} className={`${styles.chip} ${styles.chipOn}`} onClick={() => toggleInterest(i)}>
                  {i} ✕
                </button>
              ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your career goals</h2>
        <div className={styles.addRow}>
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addGoal(); }
            }}
            placeholder="e.g. Launch my own business"
          />
          <button type="button" onClick={addGoal}>Add</button>
        </div>
        <ul className={styles.goalList}>
          {goals.map((g) => (
            <li key={g} className={styles.goalItem}>
              <span>{g}</span>
              <button type="button" onClick={() => removeGoal(g)} aria-label={`Remove ${g}`}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Choose a plan</h2>
        <div className={styles.plans}>
          {plans.map((p) => (
            <label
              key={p._id}
              className={`${styles.planCard} ${planId === p._id ? styles.planOn : ''}`}
            >
              <input
                type="radio"
                name="plan"
                value={p._id}
                checked={planId === p._id}
                onChange={() => setPlanId(p._id)}
              />
              <span className={styles.planName}>{p.name}</span>
              <span className={styles.planPrice}>
                ${(p.pricePerMonth / 100).toFixed(2)}/mo
              </span>
              {p.description && <span className={styles.planDesc}>{p.description}</span>}
            </label>
          ))}
        </div>
      </section>

      {error && <div className={styles.error} role="alert">{error}</div>}

      <button type="submit" className={styles.submit} disabled={saving}>
        {saving ? 'Saving…' : 'Finish setup'}
      </button>
    </form>
  );
}
