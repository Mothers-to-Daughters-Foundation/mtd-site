'use client';

import { useState, FormEvent } from 'react';
import styles from './RSVPForm.module.css';
import Button from '../ui/Button';

interface RSVPFormProps {
  eventName?: string;
  eventId?: string;
}

export default function RSVPForm({ eventName, eventId }: RSVPFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '1',
    dietary: '',
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
        throw new Error('RSVP form not configured');
      }

      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          _subject: `RSVP: ${eventName || 'Event'}`,
          eventId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit RSVP');
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        guests: '1',
        dietary: '',
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
        <h2>RSVP Confirmed!</h2>
        <p>Thank you for RSVPing. We look forward to seeing you at the event.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {eventName && (
        <div className={styles.eventInfo}>
          <h3>RSVP for: {eventName}</h3>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="rsvp-name">Name *</label>
        <input
          type="text"
          id="rsvp-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-email">Email *</label>
        <input
          type="email"
          id="rsvp-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-phone">Phone</label>
        <input
          type="tel"
          id="rsvp-phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-guests">Number of Guests</label>
        <select
          id="rsvp-guests"
          name="guests"
          value={formData.guests}
          onChange={handleChange}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num.toString()}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-dietary">Dietary Requirements</label>
        <textarea
          id="rsvp-dietary"
          name="dietary"
          value={formData.dietary}
          onChange={handleChange}
          rows={2}
          placeholder="Any dietary restrictions or allergies?"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-message">Additional Notes</label>
        <textarea
          id="rsvp-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
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
        {status === 'submitting' ? 'Submitting...' : 'Confirm RSVP'}
      </Button>
    </form>
  );
}
