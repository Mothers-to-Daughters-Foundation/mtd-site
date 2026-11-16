'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './MatchReviewQueue.module.css';

interface Candidate {
  mentorId: string;
  name: string;
  score: number;
  kind: 'deterministic' | 'soft' | 'none';
  matched: string[];
  activeMenteeCount: number;
  maxMentees: number | null;
}

interface Review {
  id: string;
  confidence: 'high' | 'low' | 'none';
  suggested_mentor_id: string | null;
  created_at: string;
  mentee: {
    id: string;
    name: string;
    interests: string[];
    careerGoals: string[];
    businessExperience: string | null;
  };
  candidates: Candidate[];
}

interface MentorOption {
  id: string;
  name: string;
  activeMenteeCount: number;
  maxMentees: number | null;
}

interface Metrics {
  auto_assigned: number;
  approved: number;
  overridden: number;
  dismissed: number;
  pending: number;
  autoResolutionRate: number | null;
  overrideRate: number | null;
  medianHoursToPair: number | null;
}

const KIND_LABEL: Record<Candidate['kind'], string> = {
  deterministic: 'Shared career area',
  soft: 'Similar wording',
  none: 'No overlap',
};

function load(m: { activeMenteeCount: number; maxMentees: number | null }) {
  return m.maxMentees == null
    ? `${m.activeMenteeCount} mentees`
    : `${m.activeMenteeCount}/${m.maxMentees} mentees`;
}

function pct(n: number | null) {
  return n == null ? '—' : `${Math.round(n * 100)}%`;
}

function hours(n: number | null) {
  if (n == null) return '—';
  return n < 48 ? `${n.toFixed(1)} h` : `${(n / 24).toFixed(1)} days`;
}

/**
 * Low-confidence matches waiting on an admin, with the top candidates and why
 * they scored, plus the decision metrics used to judge the matcher.
 */
export default function MatchReviewQueue({ onResolved }: { onResolved: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [other, setOther] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/matches/suggestions');
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Could not load the review queue.');
      return;
    }
    setError('');
    setReviews(data.pending ?? []);
    setMentors(data.mentors ?? []);
    setMetrics(data.metrics ?? null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function decide(id: string, body: { action: 'assign'; mentorId: string } | { action: 'dismiss' }) {
    setBusy(id);
    const res = await fetch(`/api/admin/matches/suggestions/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error ?? 'Could not save the decision.');
      return;
    }
    await refresh();
    onResolved();
  }

  return (
    <section className={styles.box}>
      <div className={styles.head}>
        <h2 className={styles.title}>Needs review ({reviews.length})</h2>
        {metrics && (
          <dl className={styles.metrics}>
            <div>
              <dt>Auto-resolved</dt>
              <dd>{pct(metrics.autoResolutionRate)}</dd>
            </div>
            <div>
              <dt>Admin override rate</dt>
              <dd>{pct(metrics.overrideRate)}</dd>
            </div>
            <div>
              <dt>Median time to pair</dt>
              <dd>{hours(metrics.medianHoursToPair)}</dd>
            </div>
          </dl>
        )}
      </div>

      <p className={styles.hint}>
        Mentees with an exact career-area match are paired automatically. These need a
        person: the match is weaker, or no mentor with room fits.
      </p>

      {error && <p className={styles.error}>{error}</p>}

      {reviews.length === 0 ? (
        <p className={styles.empty}>Nothing waiting for review.</p>
      ) : (
        <ul className={styles.list}>
          {reviews.map((r) => (
            <li key={r.id} className={styles.card}>
              <div className={styles.mentee}>
                <strong>{r.mentee.name}</strong>
                <span className={`${styles.badge} ${styles[`badge-${r.confidence}`]}`}>
                  {r.confidence === 'low' ? 'Low confidence' : 'No match'}
                </span>
                <p className={styles.answers}>
                  <span>Interests:</span> {r.mentee.interests.join(', ') || '—'}
                </p>
                <p className={styles.answers}>
                  <span>Goals:</span> {r.mentee.careerGoals.join(', ') || '—'}
                </p>
                {r.mentee.businessExperience && (
                  <p className={styles.answers}>
                    <span>Experience:</span> {r.mentee.businessExperience}
                  </p>
                )}
              </div>

              {r.candidates.length > 0 ? (
                <ol className={styles.candidates}>
                  {r.candidates.map((c) => (
                    <li key={c.mentorId} className={styles.candidate}>
                      <div>
                        <strong>{c.name}</strong>
                        {c.mentorId === r.suggested_mentor_id && (
                          <span className={styles.top}>Suggested</span>
                        )}
                        <p className={styles.why}>
                          {KIND_LABEL[c.kind]}
                          {c.matched.length > 0 && `: ${c.matched.join(', ')}`} · {load(c)}
                        </p>
                      </div>
                      <button
                        className={styles.assign}
                        disabled={busy === r.id}
                        onClick={() => decide(r.id, { action: 'assign', mentorId: c.mentorId })}
                      >
                        Assign
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.why}>No mentor currently has room.</p>
              )}

              <div className={styles.actions}>
                <select
                  className={styles.select}
                  value={other[r.id] ?? ''}
                  onChange={(e) => setOther({ ...other, [r.id]: e.target.value })}
                  aria-label={`Choose another mentor for ${r.mentee.name}`}
                >
                  <option value="">Assign someone else…</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({load(m)})
                    </option>
                  ))}
                </select>
                <button
                  className={styles.assign}
                  disabled={!other[r.id] || busy === r.id}
                  onClick={() => decide(r.id, { action: 'assign', mentorId: other[r.id] })}
                >
                  Assign
                </button>
                <button
                  className={styles.dismiss}
                  disabled={busy === r.id}
                  onClick={() => decide(r.id, { action: 'dismiss' })}
                >
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
