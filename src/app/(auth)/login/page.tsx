'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setStatus('error');
      setErrorMessage('Invalid email or password. Please try again.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <div className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          MTD
        </Link>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
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
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        {status === 'error' && (
          <div className={styles.error} role="alert">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/register" className={styles.link}>
          Sign up
        </Link>
      </p>
    </>
  );
}
