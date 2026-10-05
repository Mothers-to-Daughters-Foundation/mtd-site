"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestSlot } from "@/app/dashboard/availability/actions";

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
      <div style={{ maxWidth: 680 }}>
        <h1>Availability</h1>
        <p>You do not have an assigned mentor yet.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h1>Availability</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        Request a time that works for you. Your mentor approves it to schedule a
        session.
      </p>

      {error && (
        <div role="alert" style={{ color: "var(--error, #b00020)", margin: "0.5rem 0" }}>
          {error}
        </div>
      )}

      <section>
        <h2>Open times</h2>
        {open.length === 0 && <p>No open times right now.</p>}
        {open.length > 0 && (
          <label style={{ display: "block", margin: "0.5rem 0" }}>
            <span>Note to your mentor (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} style={{ width: "100%" }} />
          </label>
        )}
        {open.map((s) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
            <span>{fmt(s.startsAt)} – {fmt(s.endsAt)}</span>
            <button type="button" disabled={busy} onClick={() => request(s.id)}>Request</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Your requests</h2>
        {mine.length === 0 && <p>You have no pending or booked requests.</p>}
        {mine.map((s) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
            <span>{fmt(s.startsAt)} – {fmt(s.endsAt)}</span>
            <span>{s.status === "pending" ? "Awaiting approval" : "Booked"}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
