'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '../login/page.module.css';

type Phase = 'checking' | 'ready' | 'invalid' | 'saving' | 'done';

/**
 * Landing page for the reset email. Supports both link styles Supabase can send:
 * `?code=` (default; must be opened in the browser that asked for the reset) and
 * `?token_hash=&type=recovery` (works in any browser once the email template uses it).
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));

    async function establishSession() {
      if (params.get('error_description') || hash.get('error_description')) return false;

      const tokenHash = params.get('token_hash');
      if (tokenHash) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });
        return !otpError;
      }

      // The client exchanges ?code= on load; getSession waits for that.
      const { data } = await supabase.auth.getSession();
      if (data.session) return true;

      const code = params.get('code');
      if (code) {
        const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
        return !codeError;
      }
      return false;
    }

    establishSession()
      .then((ok) => setPhase(ok ? 'ready' : 'invalid'))
      .catch(() => setPhase('invalid'));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setPhase('saving');
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setPhase('ready');
      setError(updateError.message);
      return;
    }
    setPhase('done');
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  return (
    <>
      <div className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          MTD
        </Link>
        <h1 className={styles.title}>Choose a new password</h1>
      </div>

      {phase === 'checking' && <p className={styles.subtitle}>Checking your link…</p>}

      {phase === 'invalid' && (
        <>
          <div className={styles.error} role="alert">
            This reset link is invalid or has expired. Links work once, for a limited time, and
            must be opened in the same browser you requested them from.
          </div>
          <p className={styles.footer}>
            <Link href="/forgot-password" className={styles.link}>
              Send a new link
            </Link>
          </p>
        </>
      )}

      {phase === 'done' && (
        <div className={styles.notice} role="status">
          Password updated. Taking you to your dashboard…
        </div>
      )}

      {(phase === 'ready' || phase === 'saving') && (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="password">New password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirm">Confirm new password</label>
            <input
              type="password"
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <button type="submit" className={styles.submitButton} disabled={phase === 'saving'}>
            {phase === 'saving' ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}
    </>
  );
}
