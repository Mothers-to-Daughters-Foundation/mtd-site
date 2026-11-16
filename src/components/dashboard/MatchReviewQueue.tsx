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
  ai_status: string;
  ai_confidence: number | null;
  ai_reason: string | null;
  ai_flag: string;
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

interface AiInfo {
  enabled: boolean;
  model: string;
  minConfidence: number;
  budgetUsd: number;
  spentUsd: number | null;
  budgetExhausted: boolean;
}

interface Metrics {
  auto_assigned: number;
  ai_assigned: number;
  aiEscalationRate: number | null;
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

function aiWarn(ai: AiInfo) {
  return !ai.enabled || ai.budgetExhausted;
}

function aiSummary(ai: AiInfo) {
  const budget = `$${ai.budgetUsd.toFixed(2)}`;
  if (!ai.enabled) {
    return 'AI matching is off (no API key set). Weaker matches come straight here.';
  }
  if (ai.budgetExhausted) {
    return `This month's AI budget (${budget}) is used up. Weaker matches come straight here until next month.`;
  }
  const spent = ai.spentUsd == null ? 'unknown' : `$${ai.spentUsd.toFixed(2)}`;
  return `AI matching is on (${ai.model}). Spent ${spent} of ${budget} this month. Auto-assigns at ${Math.round(
    ai.minConfidence * 100
  )}% confidence or higher.`;
}

/**
 * Low-confidence matches waiting on an admin, with the top candidates and why
 * they scored, plus the decision metrics used to judge the matcher.
 */
export default function MatchReviewQueue({ onResolved }: { onResolved: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [ai, setAi] = useState<AiInfo | null>(null);
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
    setAi(data.ai ?? null);
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
              <dt>Sent to AI</dt>
              <dd>{pct(metrics.aiEscalationRate)}</dd>
            </div>
            <div>
              <dt>Median time to pair</dt>
              <dd>{hours(metrics.medianHoursToPair)}</dd>
            </div>
          </dl>
        )}
      </div>

      <p className={styles.hint}>
        Mentees with an exact career-area match are paired automatically. Weaker matches
        go to AI when it&apos;s on, and AI picks below its confidence threshold come here,
        as does everything when AI is off or over budget.
      </p>

      {ai && <p className={`${styles.aiBanner} ${aiWarn(ai) ? styles.aiBannerWarn : ''}`}>{aiSummary(ai)}</p>}

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
                {r.ai_flag && <p className={styles.aiFlag}>Flag: {r.ai_flag}</p>}
                {r.ai_status === 'used' && r.ai_reason && (
                  <p className={styles.aiNote}>
                    AI ({pct(r.ai_confidence)} confident): {r.ai_reason}
                  </p>
                )}
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
                          <span className={styles.top}>
                            {r.ai_status === 'used' ? 'AI pick' : 'Suggested'}
                          </span>
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
