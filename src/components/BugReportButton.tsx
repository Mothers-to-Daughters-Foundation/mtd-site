'use client';

import { useRef, useState, FormEvent } from 'react';
import styles from './BugReportButton.module.css';

/**
 * A small, low-key "report a bug" control. Opens a dialog that sends the
 * description plus the page address, browser and screen size to the team.
 * Hidden on the static GitHub Pages build, which has no API.
 */
export default function BugReportButton({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const open = () => {
    setStatus('idle');
    setError('');
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setStatus('error');
      setError('Tell us a little more: what happened, and what you expected.');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          contactEmail: email.trim() || undefined,
          pageUrl: window.location.href,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          website: trap,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setError(data.error ?? 'Could not send the report. Please try again.');
        return;
      }
      setStatus('sent');
      setDescription('');
      setEmail('');
    } catch {
      setStatus('error');
      setError('Could not send the report. Please try again.');
    }
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${tone === 'light' ? styles.light : ''}`}
        onClick={open}
        aria-label="Report a bug"
        title="Report a bug"
      >
        <span aria-hidden="true">🐞</span>
      </button>

      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="bug-title">
        {status === 'sent' ? (
          <div className={styles.body}>
            <h2 id="bug-title" className={styles.title}>
              Thank you!
            </h2>
            <p className={styles.help}>Your report reached the team.</p>
            <button type="button" className={styles.primary} onClick={close}>
              Close
            </button>
          </div>
        ) : (
          <form className={styles.body} onSubmit={submit}>
            <h2 id="bug-title" className={styles.title}>
              Report a bug
            </h2>
            <p className={styles.help}>
              What went wrong? We&apos;ll include this page&apos;s address and your browser so we
              can find it.
            </p>
            <textarea
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={4000}
              placeholder="What happened, and what did you expect?"
              aria-label="What went wrong"
              autoFocus
            />
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email, if you'd like a reply (optional)"
              aria-label="Your email (optional)"
              maxLength={200}
            />
            {/* Bots fill every field; people never see this one. */}
            <input
              className={styles.trap}
              tabIndex={-1}
              autoComplete="off"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
              aria-hidden="true"
              name="website"
            />
            {status === 'error' && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={close}>
                Cancel
              </button>
              <button type="submit" className={styles.primary} disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send report'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
