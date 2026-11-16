'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setStatus('error');
      setError('Enter the email address you signed up with.');
      return;
    }

    setStatus('sending');
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Only rate limits are worth showing; never reveal whether an account exists.
    if (resetError && resetError.status === 429) {
      setStatus('error');
      setError('Too many requests. Please wait a few minutes and try again.');
      return;
    }
    if (resetError) console.error('[forgot-password]', resetError);
    setStatus('sent');
  };

  return (
    <>
      <div className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          MTD
        </Link>
        <h1 className={styles.title}>Reset your password</h1>
        <p className={styles.subtitle}>We&apos;ll email you a link to choose a new one.</p>
      </div>

      {status === 'sent' ? (
        <div className={styles.notice} role="status">
          If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way.
          Check your inbox and spam folder, and open the link in this browser.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          {status === 'error' && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <button type="submit" className={styles.submitButton} disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className={styles.footer}>
        Remembered it?{' '}
        <Link href="/login" className={styles.link}>
          Back to sign in
        </Link>
      </p>
    </>
  );
}
