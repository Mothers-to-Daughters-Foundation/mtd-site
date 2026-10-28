'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AUDIENCE_LABELS, type ShareAudience } from '@/lib/resources/audience';
import styles from './ResourceUploader.module.css';

interface ResourceUploaderProps {
  heading: string;
  /** Admins pick the audience; mentors always share with mentees. */
  canChooseAudience?: boolean;
}

type Mode = 'file' | 'link';
type Status = 'idle' | 'saving' | 'error' | 'done';

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');
  return data;
}

const titleFromFile = (f: File) => f.name.replace(/\.[^.]+$/, '');

export default function ResourceUploader({
  heading,
  canChooseAudience = false,
}: ResourceUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState<ShareAudience>('mentee_only');
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const multiple = canChooseAudience;
  const recipients = AUDIENCE_LABELS[canChooseAudience ? audience : 'mentee_only'].toLowerCase();

  function pickFiles(list: FileList | null) {
    const picked = Array.from(list ?? []);
    if (picked.length === 0) return;
    const next = multiple ? picked : picked.slice(0, 1);
    setFiles(next);
    if (next.length === 1 && !title) setTitle(titleFromFile(next[0]));
  }

  function fail(text: string) {
    setStatus('error');
    setMessage(text);
  }

  async function shareFile(file: File, fileTitle: string) {
    const { path, token } = await postJson('/api/resources/upload-url', {
      fileName: file.name,
    });
    const { error } = await createClient()
      .storage.from('resources')
      .uploadToSignedUrl(path, token, file, {
        contentType: file.type || 'application/octet-stream',
      });
    if (error) throw new Error(`Upload failed for "${file.name}".`);
    await postJson('/api/resources', {
      path,
      contentType: file.type,
      title: fileTitle,
      description: description.trim() || undefined,
      audience,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === 'link') {
      if (!url.trim()) return fail('Please paste a link to share.');
      if (!title.trim()) return fail('Please add a title.');
    } else {
      if (files.length === 0) return fail('Please choose a file to share.');
      if (files.length === 1 && !title.trim()) return fail('Please add a title.');
    }

    setStatus('saving');
    setMessage('');

    try {
      if (mode === 'link') {
        await postJson('/api/resources', {
          url: url.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
          audience,
        });
      } else {
        for (const file of files) {
          await shareFile(file, files.length === 1 ? title.trim() : titleFromFile(file));
        }
      }
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Something went wrong.');
      router.refresh();
      return;
    }

    const count = mode === 'link' ? 1 : files.length;
    setFiles([]);
    setUrl('');
    setTitle('');
    setDescription('');
    setStatus('done');
    setMessage(`Shared ${count === 1 ? 'it' : `${count} resources`} with ${recipients}.`);
    router.refresh();
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>{heading}</h2>

      <div className={styles.modes} role="group" aria-label="What to share">
        {(['file', 'link'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.mode} ${mode === m ? styles.modeActive : ''}`}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {m === 'file' ? (multiple ? 'Files' : 'File') : 'Link'}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
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
            pickFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          {files.length > 0 ? (
            <ul className={styles.fileList}>
              {files.map((f) => (
                <li key={f.name} className={styles.fileName}>
                  📎 {f.name}
                </li>
              ))}
            </ul>
          ) : (
            <span className={styles.hint}>
              Drag &amp; drop {multiple ? 'files' : 'a file'} here, or click to choose
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            className={styles.fileInput}
            onChange={(e) => pickFiles(e.target.files)}
          />
        </div>
      ) : (
        <div className={styles.field}>
          <label htmlFor="res-url">Link</label>
          <input
            id="res-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
      )}

      {(mode === 'link' || files.length <= 1) && (
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
      )}
      {mode === 'file' && files.length > 1 && (
        <p className={styles.fieldHint}>
          Each file is shared as its own resource, titled by its file name.
        </p>
      )}

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

      {canChooseAudience && (
        <div className={styles.field}>
          <label htmlFor="res-audience">Share with</label>
          <select
            id="res-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as ShareAudience)}
          >
            {(Object.keys(AUDIENCE_LABELS) as ShareAudience[]).map((a) => (
              <option key={a} value={a}>
                {AUDIENCE_LABELS[a]}
              </option>
            ))}
          </select>
          <span className={styles.fieldHint}>
            Everyone in this group gets a notification.
          </span>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.error} role="alert">
          {message}
        </div>
      )}
      {status === 'done' && (
        <div className={styles.success} role="status">
          {message}
        </div>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={status === 'saving'}
      >
        {status === 'saving' ? 'Sharing…' : `Share with ${recipients}`}
      </button>
    </form>
  );
}
