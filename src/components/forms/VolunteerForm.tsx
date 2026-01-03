'use client';

import { useState, FormEvent } from 'react';
import styles from './VolunteerForm.module.css';
import Button from '../ui/Button';

export default function VolunteerForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    experience: '',
    availability: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
      
      if (!formspreeId) {
        throw new Error('Form submission endpoint not configured');
      }

      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          _subject: 'Volunteer Application',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        interest: '',
        experience: '',
        availability: '',
        message: '',
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'An error occurred. Please try again.'
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        <p>Your volunteer application has been submitted. We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label htmlFor="volunteer-name">Name *</label>
        <input
          type="text"
          id="volunteer-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="volunteer-email">Email *</label>
        <input
          type="email"
          id="volunteer-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="volunteer-phone">Phone</label>
        <input
          type="tel"
          id="volunteer-phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="volunteer-interest">Area of Interest *</label>
        <select
          id="volunteer-interest"
          name="interest"
          value={formData.interest}
          onChange={handleChange}
          required
          aria-required="true"
        >
          <option value="">Select an option</option>
          <option value="mentoring">Mentoring</option>
          <option value="events">Events</option>
          <option value="administration">Administration</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="volunteer-experience">Relevant Experience</label>
        <textarea
          id="volunteer-experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="volunteer-availability">Availability</label>
        <textarea
          id="volunteer-availability"
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          rows={3}
          placeholder="e.g., Weekday evenings, Saturday mornings"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="volunteer-message">Additional Message</label>
        <textarea
          id="volunteer-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
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
        {status === 'submitting' ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  );
}
