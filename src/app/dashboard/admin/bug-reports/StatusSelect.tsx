"use client";

import { useState } from "react";
import styles from "./page.module.css";

const LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
  wont_fix: "Won't fix",
};

export default function StatusSelect({ id, initial }: { id: string; initial: string }) {
  const [status, setStatus] = useState(initial);
  const [saving, setSaving] = useState(false);

  const change = async (next: string) => {
    const previous = status;
    setStatus(next);
    setSaving(true);
    const res = await fetch(`/api/admin/bug-reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (!res.ok) setStatus(previous);
  };

  return (
    <select
      className={styles.status}
      value={status}
      disabled={saving}
      onChange={(e) => change(e.target.value)}
      aria-label="Report status"
    >
      {Object.entries(LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
