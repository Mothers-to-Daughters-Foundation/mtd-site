'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mentee' as 'mentor' | 'mentee',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          role: formData.role,
        },
      },
    });

    if (error) {
      setStatus('error');
      // Map known Supabase error codes to friendly messages
      if (error.message.toLowerCase().includes('already registered')) {
        setErrorMessage('An account with this email already exists.');
      } else if (error.message.toLowerCase().includes('invalid email')) {
        setErrorMessage('Please enter a valid email address.');
      } else if (error.message.toLowerCase().includes('password')) {
        setErrorMessage('Password must be at least 8 characters.');
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
      return;
    }

    setStatus('success');
    setTimeout(() => router.push('/login'), 2000);
  };

  if (status === 'success') {
    return (
      <div className={styles.successMessage}>
        <h2>Account created!</h2>
        <p>Check your email to confirm your address, then sign in.</p>
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
        <p className={styles.subtitle}>Join the MTD community today</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="name">Full name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
            placeholder="Jane Smith"
          />
        </div>

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
          <label htmlFor="role">I am joining as a…</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="mentee">Mentee — I&apos;m looking for guidance</option>
            <option value="mentor">Mentor — I want to guide others</option>
          </select>
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
        Already have an account?{' '}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </>
  );
}
