'use client';

import { useState, FormEvent } from 'react';
import Button from '../ui/Button';
import styles from './NewsletterFormInline.module.css';

export default function NewsletterFormInline() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'An error occurred. Please try again.'
      );
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.successMessage}>
        <p>Thank you for subscribing!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.emailField}>
        <label htmlFor="newsletter-email-inline" className="sr-only">
          Email address
        </label>
        <input
          type="email"
          id="newsletter-email-inline"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          aria-required="true"
          className={styles.emailInput}
          disabled={status === 'submitting'}
        />
        <Button type="submit" variant="primary" size="lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
      {status === 'error' && (
        <div className={styles.errorMessage} role="alert">
          {errorMessage}
        </div>
      )}
      <p className={styles.privacyNote}>
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  );
}
