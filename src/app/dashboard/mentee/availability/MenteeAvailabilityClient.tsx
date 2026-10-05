"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestSlot } from "@/app/dashboard/availability/actions";
import styles from "./MenteeAvailabilityClient.module.css";

export type MenteeSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: "open" | "pending" | "booked";
  isMine: boolean;
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MenteeAvailabilityClient({
  slots,
  hasMentor,
}: {
  slots: MenteeSlot[];
  hasMentor: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const open = slots.filter((s) => s.status === "open");
  const mine = slots.filter((s) => s.isMine && s.status !== "open");

  async function request(slotId: string) {
    setError("");
    setBusy(true);
    const res = await requestSlot(slotId, note || undefined);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Could not request this slot.");
    else {
      setNote("");
      router.refresh();
    }
  }

  if (!hasMentor) {
    return (
      <div className={styles.page}>
        <h1>Availability</h1>
        <p>You do not have an assigned mentor yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Availability</h1>
      <p className={styles.intro}>
        Request a time that works for you. Your mentor approves it to schedule a
        session.
      </p>

      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}

      <section>
        <h2>Open times</h2>
        {open.length === 0 && <p>No open times right now.</p>}
        {open.length > 0 && (
          <label className={styles.noteField}>
            <span>Note to your mentor (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} className={styles.noteInput} />
          </label>
        )}
        {open.map((s) => (
          <div key={s.id} className={styles.row}>
            <span>{fmt(s.startsAt)} – {fmt(s.endsAt)}</span>
            <button type="button" disabled={busy} onClick={() => request(s.id)}>Request</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Your requests</h2>
        {mine.length === 0 && <p>You have no pending or booked requests.</p>}
        {mine.map((s) => (
          <div key={s.id} className={styles.row}>
            <span>{fmt(s.startsAt)} – {fmt(s.endsAt)}</span>
            <span>{s.status === "pending" ? "Awaiting approval" : "Booked"}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
