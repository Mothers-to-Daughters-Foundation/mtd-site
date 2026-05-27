'use client';

import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

export default function MenteeProfilePage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: session?.user?.name ?? '',
    bio: '',
    phone: '',
    location: '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setStatus('saving');
    setError('');

    try {
      const res = await fetch(`/api/admin/users/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          profile: {
            bio: formData.bio,
            phone: formData.phone,
            location: formData.location,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to save');
      }

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>Update your information</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="bio">About Me</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Share a bit about yourself and your goals…"
          />
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
            />
          </div>
        </div>

        {status === 'error' && (
          <div className={styles.error} role="alert">{error}</div>
        )}
        {status === 'saved' && (
          <div className={styles.success} role="status">Profile saved!</div>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status === 'saving'}
        >
          {status === 'saving' ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
