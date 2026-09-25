export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  getMentorshipsByMentor,
} from "@/lib/supabase/mentorships";

import {
  getUserById,
} from "@/lib/supabase/users";

import StatCard from "@/components/dashboard/StatCard";

import styles from "./page.module.css";

export default async function MentorDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getUserById(user.id);

  if (!profile) redirect("/login");

  if (
    profile.role !== "mentor" &&
    profile.role !== "admin"
  ) {
    redirect("/dashboard");
  }

  const mentorships =
    await getMentorshipsByMentor(user.id);

  const activeMentees = mentorships.filter(
    (m) => m.status === "active"
  );

  const mentees = await Promise.all(
    activeMentees.map((m) => getUserById(m.mentee_id))
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Welcome, {profile.full_name}
        </h1>

        <p className={styles.subtitle}>
          Mentor Dashboard
        </p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          label="Active Mentees"
          value={activeMentees.length}
          accent
        />

        <StatCard
          label="Total Mentorships"
          value={mentorships.length}
        />

        <StatCard
          label="Paused"
          value={
            mentorships.filter(
              (m) => m.status === "paused"
            ).length
          }
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Your Active Mentees
        </h2>

        <div className={styles.menteeGrid}>
          {mentees.map((mentee) => {
            if (!mentee) return null;

            return (
              <div
                key={mentee.id}
                className={styles.menteeCard}
              >
                <div className={styles.menteeAvatar}>
                  {mentee.full_name?.charAt(0)}
                </div>

                <div>
                  <div className={styles.menteeName}>
                    {mentee.full_name}
                  </div>

                  <div className={styles.menteeDetail}>
                    {mentee.city}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}