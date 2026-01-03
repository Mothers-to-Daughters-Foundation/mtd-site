'use client';

import { useState, FormEvent } from 'react';
import styles from './ContactForm.module.css';
import Button from '../ui/Button';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // TODO: Replace with actual form submission endpoint
      const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
      
      if (!formspreeId) {
        throw new Error('Form submission endpoint not configured');
      }

      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'An error occurred. Please try again.'
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (status === 'success') {
    return (
      <div className={styles.successMessage}>
        <h2>Thank you!</h2>
        <p>Your message has been sent. We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="subject">Subject *</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          required
          aria-required="true"
        />
      </div>

      {status === 'error' && (
        <div className={styles.errorMessage} role="alert">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
