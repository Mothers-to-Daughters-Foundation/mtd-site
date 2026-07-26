"use client";

import { useState } from "react";
import styles from "./MatchManager.module.css";


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

interface MatchManagerProps {
  matches: Match[];
  mentors: User[];
  mentees: User[];
  userMap: Record<string, User>;
}

export default function MatchManager({
  matches: initialMatches,
  mentors,
  mentees,
  userMap,
}: MatchManagerProps) {
  const [matches, setMatches] = useState(initialMatches);

  const [mentorId, setMentorId] = useState("");
  const [menteeId, setMenteeId] = useState("");

  const [creating, setCreating] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  function showMessage(
    text: string,
    type: "success" | "error"
  ) {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  async function createMatch() {
    if (!mentorId || !menteeId) {
      showMessage("Select both mentor and mentee.", "error");
      return;
    }

    setCreating(true);

    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mentor_id: mentorId,
        mentee_id: menteeId,
      }),
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

  async function updateStatus(
    id: string,
    status: Match["status"]
  ) {
    const res = await fetch("/api/admin/matches", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status,
      }),
    });

    if (!res.ok) {
      showMessage("Unable to update mentorship.", "error");
      return;
    }

    setMatches((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status } : m
      )
    );

    showMessage("Status updated.", "success");
  }

  const getUser = (id: string) => userMap[id];

  return (
    <div>
      {message && (
        <div className={`${styles.alert} ${styles[`alert-${messageType}`]}`}>
          {message}
        </div>
      )}

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

              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name}
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

              {mentees.map((mentee) => (
                <option key={mentee.id} value={mentee.id}>
                  {mentee.name}
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

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mentor</th>
              <th>Mentee</th>
              <th>Status</th>
              <th>Started</th>
              <th>Update</th>
            </tr>
          </thead>

          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>
                  No mentorships found.
                </td>
              </tr>
            ) : (
              matches.map((match) => (
                <tr key={match.id}>
                  <td>{getUser(match.mentor_id)?.name ?? "Unknown"}</td>

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
                        updateStatus(
                          match.id,
                          e.target.value as Match["status"]
                        )
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