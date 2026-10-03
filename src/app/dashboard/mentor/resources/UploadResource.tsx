'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './upload.module.css';

export default function UploadResource() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error' | 'done'>(
    'idle'
  );
  const [error, setError] = useState('');

  function pickFile(f: File | null) {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setStatus('error');
      setError('Please choose a file to share.');
      return;
    }
    if (!title.trim()) {
      setStatus('error');
      setError('Please add a title.');
      return;
    }

    setStatus('saving');
    setError('');

    const body = new FormData();
    body.append('file', file);
    body.append('title', title.trim());
    body.append('description', description.trim());

    const res = await fetch('/api/mentor/resources', {
      method: 'POST',
      body,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus('error');
      setError(data.error ?? 'Upload failed.');
      return;
    }

    setFile(null);
    setTitle('');
    setDescription('');
    setStatus('done');
    router.refresh();
    setTimeout(() => setStatus('idle'), 2500);
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>Share a resource with your mentees</h2>

      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pickFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {file ? (
          <span className={styles.fileName}>📎 {file.name}</span>
        ) : (
          <span className={styles.hint}>
            Drag &amp; drop a file here, or click to choose
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          className={styles.fileInput}
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="res-title">Title</label>
        <input
          id="res-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Goal-setting worksheet"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="res-desc">Description (optional)</label>
        <textarea
          id="res-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short note about this resource…"
        />
      </div>

      {status === 'error' && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      {status === 'done' && (
        <div className={styles.success} role="status">
          Shared with your mentees.
        </div>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={status === 'saving'}
      >
        {status === 'saving' ? 'Sharing…' : 'Share with mentees'}
      </button>
    </form>
  );
}
