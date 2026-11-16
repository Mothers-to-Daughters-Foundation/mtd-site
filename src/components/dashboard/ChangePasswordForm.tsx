'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

type FormStyles = { readonly [key: string]: string };

/**
 * Lets a signed-in user replace their password, e.g. the temporary one an
 * admin set when creating a mentor account. Styled by the host page.
 */
export default function ChangePasswordForm({ styles }: { styles: FormStyles }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setStatus('error');
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setError('Passwords do not match.');
      return;
    }

    setStatus('saving');
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setStatus('error');
      setError(error.message);
      return;
    }
    setPassword('');
    setConfirm('');
    setStatus('saved');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
      style={{ marginTop: 'var(--spacing-6)' }}
    >
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Change password</h2>

      <div className={styles.field}>
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="confirm-password">Confirm new password</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {status === 'error' && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      {status === 'saved' && (
        <div className={styles.success} role="status">
          Password updated.
        </div>
      )}

      <button type="submit" className={styles.submitBtn} disabled={status === 'saving'}>
        {status === 'saving' ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
