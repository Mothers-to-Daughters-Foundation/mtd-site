'use client';

import { useState, FormEvent } from 'react';
import styles from './ContactForm.module.css';
import Button from '../ui/Button';

interface CheckboxGroup {
  /** Field name sent with the submission. */
  name: string;
  legend: string;
  options: string[];
}

interface ContactFormProps {
  /** Label for the name field. */
  nameLabel?: string;
  /** Show the Subject field (default true). */
  includeSubject?: boolean;
  /** Show the Message field (default true). */
  includeMessage?: boolean;
  /** Show an optional Company name field. */
  includeCompany?: boolean;
  /** Optional multi-select checkbox list (e.g. partnership tiers). */
  checkboxGroup?: CheckboxGroup;
  /** Sent as Formspree's `_subject` so submissions are easy to tell apart. */
  formSubject?: string;
  submitLabel?: string;
  successMessage?: string;
}

const emptyForm = { name: '', email: '', company: '', subject: '', message: '' };

export default function ContactForm({
  nameLabel = 'Name',
  includeSubject = true,
  includeMessage = true,
  includeCompany = false,
  checkboxGroup,
  formSubject,
  submitLabel = 'Send Message',
  successMessage = 'Your message has been sent. We’ll get back to you soon.',
}: ContactFormProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [checked, setChecked] = useState<string[]>([]);
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

      const payload: Record<string, string> = { name: formData.name, email: formData.email };
      if (includeCompany) payload.company = formData.company;
      if (includeSubject) payload.subject = formData.subject;
      if (includeMessage) payload.message = formData.message;
      if (checkboxGroup) payload[checkboxGroup.name] = checked.join(', ');
      if (formSubject) payload._subject = formSubject;

      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setStatus('success');
      setFormData(emptyForm);
      setChecked([]);
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

  const toggleOption = (option: string) => {
    setChecked((current) =>
      current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option]
    );
  };

  if (status === 'success') {
    return (
      <div className={styles.successMessage}>
        <h2>Thank you!</h2>
        <p>{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label htmlFor="name">{nameLabel} *</label>
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

      {includeCompany && (
        <div className={styles.field}>
          <label htmlFor="company">Company name</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </div>
      )}

      {includeSubject && (
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
      )}

      {checkboxGroup && (
        <fieldset className={styles.checkboxGroup}>
          <legend>{checkboxGroup.legend}</legend>
          {checkboxGroup.options.map((option) => (
            <label key={option} className={styles.checkboxOption}>
              <input
                type="checkbox"
                name={checkboxGroup.name}
                value={option}
                checked={checked.includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
      )}

      {includeMessage && (
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
      )}

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
        {status === 'submitting' ? 'Sending...' : submitLabel}
      </Button>
    </form>
  );
}
