export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { getMentorshipsByMentor } from "@/lib/supabase/mentorships";
import { getUserById } from "@/lib/supabase/users";

import styles from "./page.module.css";

export const metadata = {
  title: "My Mentees | Mentor",
};

export default async function MentorMenteesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserById(user.id);

  if (!profile) {
    redirect("/login");
  }

  if (
    profile.role !== "mentor" &&
    profile.role !== "admin"
  ) {
    redirect("/dashboard");
  }

  const mentorships = await getMentorshipsByMentor(user.id);

  const mentees = await Promise.all(
    mentorships.map(async (mentorship) => ({
      mentorship,
      mentee: await getUserById(mentorship.mentee_id),
    }))
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>My Mentees</h1>

        <p className={styles.subtitle}>
          {mentees.length} total mentee(s)
        </p>
      </div>

      {mentees.length === 0 ? (
        <div className={styles.empty}>
          No mentees assigned yet.
        </div>
      ) : (
        <div className={styles.list}>
          {mentees.map(({ mentorship, mentee }) => {
            if (!mentee) return null;

            return (
              <div
                key={mentorship.id}
                className={styles.card}
              >
                <div className={styles.avatar}>
                  {mentee.full_name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className={styles.info}>
                  <div className={styles.name}>
                    {mentee.full_name}
                  </div>

                  <div className={styles.email}>
                    {mentee.email}
                  </div>

                  {mentee.bio && (
                    <div className={styles.bio}>
                      {mentee.bio}
                    </div>
                  )}

                  {mentee.phone && (
                    <div className={styles.detail}>
                      📞 {mentee.phone}
                    </div>
                  )}

                  {(mentee.city || mentee.country) && (
                    <div className={styles.detail}>
                      📍{" "}
                      {[mentee.city, mentee.country]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </div>

                <div className={styles.meta}>
                  <span
                    className={`${styles.badge} ${
                      styles[
                        `badge-${mentorship.status}`
                      ]
                    }`}
                  >
                    {mentorship.status}
                  </span>

                  {mentorship.created_at && (
                    <div className={styles.date}>
                      Since{" "}
                      {new Date(
                        mentorship.created_at
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}