'use client';

import { useEffect, useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function MenteeProfilePage() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
  });

  const [status, setStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) return;

      setFormData({
        name: data.full_name ?? '',
        bio: data.bio ?? '',
        phone: data.phone ?? '',
        location: [data.city, data.country]
          .filter(Boolean)
          .join(', '),
      });
    }

    loadProfile();
  }, [supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!userId) return;

    setStatus('saving');
    setError('');

    try {
      const [city, country] = formData.location
        .split(',')
        .map((v) => v.trim());

      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.name,
          bio: formData.bio,
          phone: formData.phone,
          city: city || null,
          country: country || null,
        })
        .eq('id', userId);

      if (error) throw error;

      setStatus('saved');

      setTimeout(() => {
        setStatus('idle');
      }, 2500);
    } catch (err) {
      setStatus('error');

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save profile'
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>

        <p className={styles.subtitle}>
          Update your information
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={styles.form}
      >
        <div className={styles.field}>
          <label htmlFor="name">Full Name</label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="bio">About Me</label>

          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Share a bit about yourself and your goals..."
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="phone">Phone</label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="location">Location</label>

            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>
        </div>

        {status === 'error' && (
          <div
            className={styles.error}
            role="alert"
          >
            {error}
          </div>
        )}

        {status === 'saved' && (
          <div
            className={styles.success}
            role="status"
          >
            Profile saved successfully!
          </div>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status === 'saving'}
        >
          {status === 'saving'
            ? 'Saving...'
            : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}