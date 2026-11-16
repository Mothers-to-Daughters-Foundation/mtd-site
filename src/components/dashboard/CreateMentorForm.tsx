'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { INTEREST_CATEGORIES } from '@/lib/onboarding-options';
import styles from './CreateMentorForm.module.css';

function temporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

const EMPTY = { name: '', email: '', password: '', expertise: '', maxMentees: '' };

/** Admin-only: create a mentor's login and matching profile in one step. */
export default function CreateMentorForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [careerAreas, setCareerAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  const update = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggle = (area: string) =>
    setCareerAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        careerAreas,
        expertise: form.expertise || undefined,
        maxMentees: form.maxMentees ? Number(form.maxMentees) : null,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not create the mentor.');
      return;
    }

    setCreated({ email: form.email, password: form.password });
    setForm(EMPTY);
    setCareerAreas([]);
    router.refresh();
  };

  if (!open) {
    return (
      <button className={styles.openBtn} onClick={() => setOpen(true)}>
        + Add mentor
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.box}>
      <h2 className={styles.title}>Add mentor</h2>
      <p className={styles.hint}>
        Mentors can&apos;t sign up themselves. Create the account here, then send them
        their email and temporary password privately. They can change it under My Profile.
      </p>

      {created && (
        <div className={styles.success} role="status">
          Created <strong>{created.email}</strong> with temporary password{' '}
          <code>{created.password}</code>. Copy it now; it won&apos;t be shown again.
        </div>
      )}

      <div className={styles.row}>
        <label className={styles.field}>
          Full name
          <input name="name" value={form.name} onChange={update} required />
        </label>
        <label className={styles.field}>
          Email
          <input name="email" type="email" value={form.email} onChange={update} required />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          Temporary password
          <span className={styles.inline}>
            <input
              name="password"
              value={form.password}
              onChange={update}
              minLength={8}
              required
            />
            <button
              type="button"
              className={styles.secondary}
              onClick={() => setForm({ ...form, password: temporaryPassword() })}
            >
              Generate
            </button>
          </span>
        </label>
        <label className={styles.field}>
          Maximum mentees at a time
          <input
            name="maxMentees"
            type="number"
            min={1}
            value={form.maxMentees}
            onChange={update}
            placeholder="Blank = no limit"
          />
        </label>
      </div>

      <label className={styles.field}>
        Areas of expertise
        <input
          name="expertise"
          value={form.expertise}
          onChange={update}
          placeholder="e.g. Small business finance, nonprofit leadership"
        />
      </label>

      <fieldset className={styles.field}>
        <legend>Career areas (used for matching)</legend>
        <div className={styles.chips}>
          {INTEREST_CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => toggle(c)}
              aria-pressed={careerAreas.includes(c)}
              className={`${styles.chip} ${careerAreas.includes(c) ? styles.chipOn : ''}`}
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.inline}>
        <button type="submit" className={styles.submit} disabled={saving}>
          {saving ? 'Creating…' : 'Create mentor'}
        </button>
        <button type="button" className={styles.secondary} onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
    </form>
  );
}
