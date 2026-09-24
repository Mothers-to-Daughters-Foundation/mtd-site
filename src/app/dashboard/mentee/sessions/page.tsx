import { createClient } from '@/lib/supabase/server';
import { getMySessions } from '@/lib/models/session';

import styles from './page.module.css';

export const metadata = {
  title: 'Sessions',
};

export default async function MenteeSessionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const sessions = await getMySessions(user.id);

  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === 'scheduled' ||
      session.status === 'confirmed'
  );

  const pastSessions = sessions.filter(
    (session) =>
      session.status === 'completed' ||
      session.status === 'cancelled' ||
      session.status === 'no_show'
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Sessions</h1>

          <p>
            View your upcoming and previous mentoring sessions.
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Upcoming Sessions</h2>

          <span className={styles.count}>
            {upcomingSessions.length}
          </span>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className={styles.empty}>
            <h3>No upcoming sessions</h3>

            <p>
              You currently have no scheduled mentoring sessions.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h3>{session.title}</h3>

                    <span
                      className={`${styles.status} ${
                        session.status === 'confirmed'
                          ? styles.confirmed
                          : styles.scheduled
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>

                {session.description && (
                  <p className={styles.description}>
                    {session.description}
                  </p>
                )}

                <div className={styles.details}>
                  <div>
                    <strong>Date</strong>

                    <span>
                      {new Date(
                        session.scheduled_start
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <strong>Time</strong>

                    <span>
                      {new Date(
                        session.scheduled_start
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <strong>Duration</strong>

                    <span>
                      {session.duration_minutes} minutes
                    </span>
                  </div>

                  <div>
                    <strong>Meeting</strong>

                    <span>
                      {session.meeting_type.replace(
                        '_',
                        ' '
                      )}
                    </span>
                  </div>
                </div>

                {session.meeting_link && (
                  <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.meetingLink}
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Past Sessions</h2>

          <span className={styles.count}>
            {pastSessions.length}
          </span>
        </div>

        {pastSessions.length === 0 ? (
          <div className={styles.empty}>
            <h3>No past sessions</h3>

            <p>
              Completed or cancelled sessions will appear here.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {pastSessions.map((session) => (
              <div
                key={session.id}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h3>{session.title}</h3>

                    <span
                      className={`${styles.status} ${
                        session.status === 'completed'
                          ? styles.completed
                          : session.status === 'cancelled'
                          ? styles.cancelled
                          : styles.noShow
                      }`}
                    >
                      {session.status.replace(
                        '_',
                        ' '
                      )}
                    </span>
                  </div>
                </div>

                {session.description && (
                  <p className={styles.description}>
                    {session.description}
                  </p>
                )}

                <div className={styles.details}>
                  <div>
                    <strong>Date</strong>

                    <span>
                      {new Date(
                        session.scheduled_start
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <strong>Time</strong>

                    <span>
                      {new Date(
                        session.scheduled_start
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <strong>Duration</strong>

                    <span>
                      {session.duration_minutes} minutes
                    </span>
                  </div>
                </div>

                {session.cancellation_reason && (
                  <p className={styles.note}>
                    <strong>Cancellation reason:</strong>{' '}
                    {session.cancellation_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}