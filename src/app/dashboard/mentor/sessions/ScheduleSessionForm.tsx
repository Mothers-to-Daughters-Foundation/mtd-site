"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/app/dashboard/sessions/actions";

import styles from "./ScheduleSessionForm.module.css";

interface Mentee {
  id: string;
  full_name: string | null;
  email?: string | null;
  mentorship_id: string;
}

interface Props {
  mentorId: string;
  mentees: Mentee[];
}

const meetingTypes = [
  {
    value: "google_meet",
    label: "Google Meet",
  },
  {
    value: "zoom",
    label: "Zoom",
  },
  {
    value: "microsoft_teams",
    label: "Microsoft Teams",
  },
  {
    value: "phone",
    label: "Phone",
  },
  {
    value: "in_person",
    label: "In Person",
  },
  {
    value: "other",
    label: "Other",
  },
] as const;

export default function ScheduleSessionForm({
  mentorId,
  mentees,
}: Props) {
  const router = useRouter();

  const [menteeId, setMenteeId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [duration, setDuration] = useState("60");

  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );

  const [meetingType, setMeetingType] =
    useState<
      (typeof meetingTypes)[number]["value"]
    >("google_meet");

  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Find the selected mentee's active mentorship.
   *
   * The NewSessionPage already provides each mentee
   * with its corresponding mentorship_id.
   */
  const selectedMentee = mentees.find(
    (mentee) => mentee.id === menteeId
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    /*
     * Make sure a mentee has been selected.
     */
    if (!menteeId) {
      setError("Please select a mentee.");
      return;
    }

    /*
     * The mentorship ID is now obtained automatically
     * from the selected active mentorship relationship.
     */
    if (!selectedMentee?.mentorship_id) {
      setError(
        "Unable to find an active mentorship relationship for this mentee."
      );
      return;
    }

    /*
     * Validate date and time fields.
     */
    if (!date || !startTime || !endTime) {
      setError(
        "Please provide the session date, start time, and end time."
      );
      return;
    }

    /*
     * Convert the local date/time entered by the mentor
     * into Date objects.
     */
    const start = new Date(
      `${date}T${startTime}`
    );

    const end = new Date(
      `${date}T${endTime}`
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setError("Please enter a valid date and time.");
      return;
    }

    /*
     * End time must be later than start time.
     */
    if (end <= start) {
      setError(
        "The end time must be later than the start time."
      );
      return;
    }

    /*
     * Calculate the actual duration from the selected
     * start and end times.
     *
     * This prevents the duration from becoming inconsistent
     * with the actual scheduled time.
     */
    const calculatedDuration = Math.round(
      (end.getTime() - start.getTime()) /
        (1000 * 60)
    );

    if (calculatedDuration <= 0) {
      setError(
        "The session duration must be greater than zero."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Create the session.
       *
       * mentorship_id comes automatically from the
       * selected mentee's active mentorship relationship.
       */
      await createSession({
        mentorship_id:
          selectedMentee.mentorship_id,

        mentor_id: mentorId,

        mentee_id: menteeId,

        title: title.trim(),

        description:
          description.trim() || undefined,

        scheduled_start:
          start.toISOString(),

        scheduled_end:
          end.toISOString(),

        duration_minutes:
          calculatedDuration,

        timezone,

        meeting_type: meetingType,

        meeting_link:
          meetingLink.trim() || undefined,

        location:
          location.trim() || undefined,
      });

      /*
       * Return to the mentor's Sessions page.
       */
      router.push(
        "/dashboard/mentor/sessions"
      );

      /*
       * Refresh the server-rendered session list.
       */
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to schedule the session."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.formHeader}>
        <div>
          <h2>Schedule Session</h2>

          <p>
            Create a mentoring session with one of your
            mentees.
          </p>
        </div>
      </div>

      {error && (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      )}

      <div className={styles.section}>
        <h3>Session Details</h3>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Mentee *</span>

            <select
              value={menteeId}
              onChange={(event) =>
                setMenteeId(event.target.value)
              }
              required
            >
              <option value="">
                Select a mentee
              </option>

              {mentees.map((mentee) => (
                <option
                  key={mentee.id}
                  value={mentee.id}
                >
                  {mentee.full_name ||
                    mentee.email ||
                    "Unnamed mentee"}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Session Title *</span>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Career Development Session"
              required
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>Description</span>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="What will this session focus on?"
            rows={4}
          />
        </label>
      </div>

      <div className={styles.section}>
        <h3>Date & Time</h3>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Date *</span>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              required
            />
          </label>

          <label className={styles.field}>
            <span>Start Time *</span>

            <input
              type="time"
              value={startTime}
              onChange={(event) =>
                setStartTime(event.target.value)
              }
              required
            />
          </label>

          <label className={styles.field}>
            <span>End Time *</span>

            <input
              type="time"
              value={endTime}
              onChange={(event) =>
                setEndTime(event.target.value)
              }
              required
            />
          </label>

          <label className={styles.field}>
            <span>Timezone</span>

            <input
              type="text"
              value={timezone}
              onChange={(event) =>
                setTimezone(event.target.value)
              }
            />
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Meeting Information</h3>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Meeting Type *</span>

            <select
              value={meetingType}
              onChange={(event) =>
                setMeetingType(
                  event.target.value as (typeof meetingTypes)[number]["value"]
                )
              }
              required
            >
              {meetingTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Meeting Link</span>

            <input
              type="url"
              value={meetingLink}
              onChange={(event) =>
                setMeetingLink(event.target.value)
              }
              placeholder="https://..."
            />
          </label>

          <label className={styles.field}>
            <span>Location</span>

            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="Physical location, if applicable"
            />
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() =>
            router.push(
              "/dashboard/mentor/sessions"
            )
          }
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading
            ? "Scheduling..."
            : "Schedule Session"}
        </button>
      </div>
    </form>
  );
}