'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './AvatarUpload.module.css';

interface AvatarUploadProps {
  userId: string;
  initialUrl?: string | null;
  name?: string;
}

const OUTPUT_SIZE = 400;

function initials(name?: string): string {
  if (!name) return '🙂';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/** Center-crop an image file to a square JPEG blob. */
function cropToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Crop failed'))),
        'image/jpeg',
        0.9
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });
}

export default function AvatarUpload({
  userId,
  initialUrl,
  name,
}: AvatarUploadProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setError('Please choose an image file.');
      return;
    }

    setStatus('uploading');
    setError('');

    try {
      const blob = await cropToSquare(file);
      const path = `${userId}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, {
          upsert: true,
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path);

      const bustedUrl = `${publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: bustedUrl })
        .eq('id', userId);
      if (updateError) throw updateError;

      setUrl(bustedUrl);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.avatar}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Profile photo" className={styles.image} />
        ) : (
          <span className={styles.initials}>{initials(name)}</span>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => inputRef.current?.click()}
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? 'Uploading…' : 'Change photo'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className={styles.fileInput}
        />
        {status === 'error' && (
          <span className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
