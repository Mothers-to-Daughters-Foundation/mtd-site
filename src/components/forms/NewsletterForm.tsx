'use client';

import { useState, FormEvent } from 'react';
import styles from './NewsletterForm.module.css';
import Button from '../ui/Button';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // TODO: Replace with actual newsletter subscription endpoint
      // This could be Mailchimp, Formspree, or a custom API route
      const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
      
      if (!formspreeId) {
        throw new Error('Newsletter subscription not configured');
      }

      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          _subject: 'Newsletter Subscription',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
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
      <div className={styles.field}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          type="email"
          id="newsletter-email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          aria-required="true"
          className={styles.input}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>

      {status === 'error' && (
        <div className={styles.errorMessage} role="alert">
          {errorMessage}
        </div>
      )}
    </form>
  );
}
