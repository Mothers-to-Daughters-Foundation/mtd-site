"use client";

import { useEffect, useState } from "react";
import styles from "@/components/dashboard/MatchManager.module.css";
import pageStyles from "./page.module.css";

interface Match {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: "active" | "paused" | "completed" | "cancelled";
  start_date: string;
  end_date: string | null;
  notes: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface MentorOption {
  id: string;
  full_name: string;
}

interface AutoMatchSummary {
  matched: number;
  not_mentee: number;
  not_paid: number;
  already_matched: number;
  no_candidate: number;
  error: number;
}

export default function AdminMatchesPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [matches, setMatches] = useState<Match[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [mentees, setMentees] = useState<User[]>([]);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [mentorOptions, setMentorOptions] = useState<MentorOption[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Create-match form state ──────────────────────────────────────────────
  const [mentorId, setMentorId] = useState("");
  const [menteeId, setMenteeId] = useState("");
  const [creating, setCreating] = useState(false);

  // ── Auto-match state ────────────────────────────────────────────────────
  const [running, setRunning] = useState(false);
  const [autoSummary, setAutoSummary] = useState<AutoMatchSummary | null>(null);

  // ── Message state ────────────────────────────────────────────────────────
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // ── Helpers ─────────────────────────────────────────────────────────────
  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }

  const getUser = (id: string) => userMap[id];

  // ── Fetch matches list ───────────────────────────────────────────────────
  async function fetchMatches() {
    const res = await fetch("/api/admin/matches");
    if (!res.ok) return;
    const data = await res.json();
    setMatches(data.matches ?? []);
  }

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [matchRes, userRes] = await Promise.all([
          fetch("/api/admin/matches"),
          fetch("/api/admin/users"),
        ]);

        if (matchRes.ok) {
          const d = await matchRes.json();
          setMatches(d.matches ?? []);
        }

        if (userRes.ok) {
          const d = await userRes.json();
          const users: Array<{ id: string; full_name: string | null; role: string }> =
            d.users ?? [];

          const map: Record<string, User> = {};
          users.forEach((u) => {
            map[u.id] = { id: u.id, name: u.full_name ?? "Unknown", email: "" };
          });
          setUserMap(map);

          setMentors(
            users
              .filter((u) => u.role === "mentor")
              .map((u) => ({ id: u.id, name: u.full_name ?? "Unnamed Mentor", email: "" }))
          );
          setMentees(
            users
              .filter((u) => u.role === "mentee")
              .map((u) => ({ id: u.id, name: u.full_name ?? "Unnamed Mentee", email: "" }))
          );
          setMentorOptions(
            users
              .filter((u) => u.role === "mentor")
              .map((u) => ({ id: u.id, full_name: u.full_name ?? "Unnamed Mentor" }))
          );
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ── Create match ─────────────────────────────────────────────────────────
  async function createMatch() {
    if (!mentorId || !menteeId) {
      showMessage("Select both mentor and mentee.", "error");
      return;
    }

    setCreating(true);
    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentor_id: mentorId, mentee_id: menteeId }),
    });
    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      showMessage(data.error ?? "Failed to create mentorship.", "error");
      return;
    }

    setMatches((prev) => [data.match, ...prev]);
    setMentorId("");
    setMenteeId("");
    showMessage("Mentorship created successfully.", "success");
  }

  // ── Update status ────────────────────────────────────────────────────────
  async function updateStatus(id: string, status: Match["status"]) {
    const res = await fetch("/api/admin/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      showMessage("Unable to update mentorship.", "error");
      return;
    }

    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    showMessage("Status updated.", "success");
  }

  // ── Reassign mentor ──────────────────────────────────────────────────────
  async function reassignMentor(id: string, newMentorId: string) {
    const res = await fetch("/api/admin/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, mentor_id: newMentorId }),
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.error ?? "Unable to reassign mentor.", "error");
      return;
    }

    await fetchMatches();
    showMessage("Mentor reassigned.", "success");
  }

  // ── Run auto-match ───────────────────────────────────────────────────────
  async function runAutoMatch() {
    setRunning(true);
    setAutoSummary(null);

    const res = await fetch("/api/admin/matches/auto", { method: "POST" });
    const data = await res.json();
    setRunning(false);

    if (!res.ok) {
      showMessage(data.error ?? "Auto-match failed.", "error");
      return;
    }

    const s: AutoMatchSummary = data.summary;
    setAutoSummary(s);
    await fetchMatches();
    showMessage("Auto-match complete.", "success");
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className={pageStyles.header}>
          <h1 className={pageStyles.title}>Mentor — Mentee Matches</h1>
          <p className={pageStyles.subtitle}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.title}>Mentor — Mentee Matches</h1>
        <p className={pageStyles.subtitle}>
          Assign mentors to mentees and manage mentorships.
        </p>
      </div>

      {message && (
        <div className={`${styles.alert} ${styles[`alert-${messageType}`]}`}>
          {message}
        </div>
      )}

      {/* ── Auto-match section ─────────────────────────────────────── */}
      <div className={styles.createBox} style={{ marginBottom: "var(--spacing-4)" }}>
        <h2 className={styles.createTitle}>Auto-Match</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "var(--spacing-4)" }}>
          Automatically pair all unmatched mentees with an available mentor.
        </p>

        <button
          onClick={runAutoMatch}
          disabled={running}
          className={styles.createBtn}
        >
          {running ? "Running…" : "Run auto-match"}
        </button>

        {autoSummary && (
          <p style={{ marginTop: "var(--spacing-3)", fontSize: "0.875rem", color: "var(--text-primary)" }}>
            {[
              autoSummary.matched > 0 && `Matched ${autoSummary.matched}`,
              autoSummary.already_matched > 0 && `${autoSummary.already_matched} already matched`,
              autoSummary.no_candidate > 0 && `${autoSummary.no_candidate} no candidate`,
              autoSummary.not_paid > 0 && `${autoSummary.not_paid} not paid`,
              autoSummary.not_mentee > 0 && `${autoSummary.not_mentee} not mentee`,
              autoSummary.error > 0 && `${autoSummary.error} error`,
            ]
              .filter(Boolean)
              .join(" · ") || "Nothing to match."}
          </p>
        )}
      </div>

      {/* ── Create-match section ───────────────────────────────────── */}
      <div className={styles.createBox}>
        <h2 className={styles.createTitle}>Assign Mentor</h2>

        <div className={styles.createRow}>
          <div className={styles.field}>
            <label>Mentor</label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Mentor</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Mentee</label>
            <select
              value={menteeId}
              onChange={(e) => setMenteeId(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Mentee</option>
              {mentees.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={createMatch}
          disabled={creating}
          className={styles.createBtn}
        >
          {creating ? "Creating..." : "Create Match"}
        </button>
      </div>

      {/* ── Matches table ─────────────────────────────────────────── */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mentor</th>
              <th>Reassign Mentor</th>
              <th>Mentee</th>
              <th>Status</th>
              <th>Started</th>
              <th>Update</th>
            </tr>
          </thead>

          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  No mentorships found.
                </td>
              </tr>
            ) : (
              matches.map((match) => (
                <tr key={match.id}>
                  <td>{getUser(match.mentor_id)?.name ?? "Unknown"}</td>

                  <td>
                    {mentorOptions.length > 0 ? (
                      <select
                        value={match.mentor_id}
                        onChange={(e) => reassignMentor(match.id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        {mentorOptions.map((mo) => (
                          <option key={mo.id} value={mo.id}>
                            {mo.full_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        No mentors
                      </span>
                    )}
                  </td>

                  <td>{getUser(match.mentee_id)?.name ?? "Unknown"}</td>

                  <td>
                    <span
                      className={`${styles.badge} ${styles[`badge-${match.status}`]}`}
                    >
                      {match.status}
                    </span>
                  </td>

                  <td>
                    {match.start_date
                      ? new Date(match.start_date).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    <select
                      value={match.status}
                      onChange={(e) =>
                        updateStatus(match.id, e.target.value as Match["status"])
                      }
                      className={styles.statusSelect}
                    >
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
