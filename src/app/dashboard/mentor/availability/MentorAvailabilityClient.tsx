"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSlot,
  deleteSlot,
  approveRequest,
  declineRequest,
} from "@/app/dashboard/availability/actions";
import type { SessionType } from "@/lib/models/session";
import styles from "./MentorAvailabilityClient.module.css";

export type MentorSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: "open" | "pending" | "booked";
  requestNote: string | null;
  requesterName: string | null;
};

const MEETING_TYPES: { value: SessionType; label: string }[] = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "microsoft_teams", label: "Microsoft Teams" },
  { value: "phone", label: "Phone" },
  { value: "in_person", label: "In Person" },
  { value: "other", label: "Other" },
];

function fmt(iso: string): string {
  return new Date(iso).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MentorAvailabilityClient({
  slots,
}: {
  slots: MentorSlot[];
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const pending = slots.filter((s) => s.status === "pending");
  const open = slots.filter((s) => s.status === "open");
  const booked = slots.filter((s) => s.status === "booked");

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!date || !startTime || !endTime) {
      setError("Please provide a date, start time, and end time.");
      return;
    }
    const startsAt = new Date(`${date}T${startTime}`).toISOString();
    const endsAt = new Date(`${date}T${endTime}`).toISOString();
    setBusy(true);
    const res = await createSlot({ startsAt, endsAt });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not add the slot.");
      return;
    }
    setDate("");
    setStartTime("");
    setEndTime("");
    router.refresh();
  }

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
    else router.refresh();
  }

  return (
    <div className={styles.page}>
      <h1>Availability</h1>
      <p className={styles.intro}>
        Publish open time slots. Your mentees can request one, and you approve it
        to create a session.
      </p>

      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={addSlot} className={styles.addForm}>
        <label className={styles.field}>
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Start</span>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>
        <label className={styles.field}>
          <span>End</span>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </label>
        <button type="submit" disabled={busy}>Add slot</button>
      </form>

      <section>
        <h2>Pending requests</h2>
        {pending.length === 0 && <p>No pending requests.</p>}
        {pending.map((s) => (
          <PendingRow key={s.id} slot={s} busy={busy} onApprove={(input) => run(() => approveRequest(input))} onDecline={() => run(() => declineRequest(s.id))} />
        ))}
      </section>

      <section>
        <h2>Open slots</h2>
        {open.length === 0 && <p>No open slots.</p>}
        {open.map((s) => (
          <div key={s.id} className={styles.row}>
            <span>{fmt(s.startsAt)} – {fmt(s.endsAt)}</span>
            <button type="button" disabled={busy} onClick={() => run(() => deleteSlot(s.id))}>Delete</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Booked</h2>
        {booked.length === 0 && <p>No booked slots yet.</p>}
        {booked.map((s) => (
          <div key={s.id} className={styles.bookedRow}>
            {fmt(s.startsAt)} – {fmt(s.endsAt)}
            {s.requesterName ? ` · ${s.requesterName}` : ""}
          </div>
        ))}
      </section>
    </div>
  );
}

function PendingRow({
  slot,
  busy,
  onApprove,
  onDecline,
}: {
  slot: MentorSlot;
  busy: boolean;
  onApprove: (input: {
    slotId: string;
    title: string;
    meetingType: SessionType;
    meetingLink?: string;
  }) => void;
  onDecline: () => void;
}) {
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState<SessionType>("google_meet");
  const [meetingLink, setMeetingLink] = useState("");

  return (
    <div className={styles.pendingRow}>
      <div><strong>{fmt(slot.startsAt)} – {fmt(slot.endsAt)}</strong></div>
      <div>Requested by {slot.requesterName ?? "a mentee"}</div>
      {slot.requestNote && <div className={styles.note}>&ldquo;{slot.requestNote}&rdquo;</div>}
      <div className={styles.actions}>
        <input placeholder="Session title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select value={meetingType} onChange={(e) => setMeetingType(e.target.value as SessionType)}>
          {MEETING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input placeholder="Meeting link (optional)" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
        <button type="button" disabled={busy || !title.trim()} onClick={() => onApprove({ slotId: slot.id, title, meetingType, meetingLink: meetingLink || undefined })}>Approve</button>
        <button type="button" disabled={busy} onClick={onDecline}>Decline</button>
      </div>
    </div>
  );
}
