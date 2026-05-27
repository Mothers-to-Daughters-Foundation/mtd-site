'use client';

import { useState } from 'react';
import styles from './MatchManager.module.css';

interface Match {
  _id: string;
  mentorId: string;
  menteeId: string;
  status: string;
  startDate?: string;
  notes?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface MatchManagerProps {
  matches: Match[];
  mentors: User[];
  mentees: User[];
  userMap: Record<string, User>;
}

export default function MatchManager({
  matches: initialMatches,
  mentors,
  mentees,
  userMap,
}: MatchManagerProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [mentorId, setMentorId] = useState('');
  const [menteeId, setMenteeId] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3500);
  };

  const handleCreate = async () => {
    if (!mentorId || !menteeId) {
      showMsg('Please select both a mentor and a mentee.', 'error');
      return;
    }
    setCreating(true);
    const res = await fetch('/api/admin/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorId, menteeId, notes, status: 'pending' }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      showMsg(data.error ?? 'Failed to create match', 'error');
    } else {
      setMatches((prev) => [data, ...prev]);
      setMentorId('');
      setMenteeId('');
      setNotes('');
      showMsg('Match created.', 'success');
    }
  };

  const handleStatusChange = async (matchId: string, newStatus: string) => {
    const res = await fetch('/api/admin/matches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, status: newStatus }),
    });
    if (res.ok) {
      setMatches((prev) =>
        prev.map((m) => (m._id === matchId ? { ...m, status: newStatus } : m))
      );
      showMsg('Status updated.', 'success');
    } else {
      showMsg('Failed to update status.', 'error');
    }
  };

  const userName = (id: string) => userMap[id]?.name ?? id;
  const userEmail = (id: string) => userMap[id]?.email ?? '';

  return (
    <div>
      {msg && (
        <div className={`${styles.alert} ${styles[`alert-${msgType}`]}`}>{msg}</div>
      )}

      <div className={styles.createBox}>
        <h2 className={styles.createTitle}>Assign New Match</h2>
        <div className={styles.createRow}>
          <div className={styles.field}>
            <label>Mentor</label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className={styles.select}
            >
              <option value="">— Select Mentor —</option>
              {mentors.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Mentee</label>
            <select
              value={menteeId}
              onChange={(e) => setMenteeId(e.target.value)}
              className={styles.select}
            >
              <option value="">— Select Mentee —</option>
              {mentees.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this pairing…"
              className={styles.input}
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className={styles.createBtn}
        >
          {creating ? 'Creating…' : 'Create Match'}
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mentor</th>
              <th>Mentee</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>Notes</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  No matches yet.
                </td>
              </tr>
            ) : (
              matches.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className={styles.personName}>{userName(m.mentorId)}</div>
                    <div className={styles.personEmail}>{userEmail(m.mentorId)}</div>
                  </td>
                  <td>
                    <div className={styles.personName}>{userName(m.menteeId)}</div>
                    <div className={styles.personEmail}>{userEmail(m.menteeId)}</div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge-${m.status}`]}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    {m.startDate
                      ? new Date(m.startDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className={styles.notesCell}>{m.notes ?? '—'}</td>
                  <td>
                    <select
                      value={m.status}
                      onChange={(e) => handleStatusChange(m._id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="pending">pending</option>
                      <option value="active">active</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
