'use client';

import { useEffect } from 'react';

export default function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    fetch('/api/blog/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);
  return null;
}
