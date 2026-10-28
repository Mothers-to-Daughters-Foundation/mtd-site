'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ResourceGrid.module.css';

export default function DeleteResourceButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${title}"? It will be removed for everyone.`)) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? 'Could not delete this resource.');
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      className={styles.deleteButton}
      onClick={handleDelete}
      disabled={busy}
    >
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  );
}
