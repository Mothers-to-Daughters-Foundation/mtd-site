'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase/auth';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setStatus('submitting');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error ?? 'Registration failed. Please try again.');
        return;
      }

      setStatus('success');
      // Sign straight in and continue to onboarding (name, age, and profile).
      const { error: signInError } = await signIn(formData.email, formData.password);
      router.push(signInError ? '/login' : '/dashboard/onboarding');
    } catch {
      setStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.successMessage}>
        <h2>Account created!</h2>
        <p>Let&apos;s set up your profile…</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          MTD
        </Link>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Join the MTD community as a mentee</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        {(status === 'error' || errorMessage) && (
          <div className={styles.error} role="alert">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className={styles.footer}>
        Mentoring with us? Your account is set up by the MTD team.
      </p>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </>
  );
}
