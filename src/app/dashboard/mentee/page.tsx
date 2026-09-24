export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/lib/supabase/users";
import { getSubscriptionByUserId } from "@/lib/supabase/subscriptions";
import { getMentorshipByMentee } from "@/lib/supabase/mentorships";
import { getPlanById } from "@/lib/supabase/plans";

import styles from "./page.module.css";

export default async function MenteeDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getUserById(user.id);

  if (!profile) redirect("/login");

  if (
    profile.role !== "mentee" &&
    profile.role !== "admin"
  ) {
    redirect("/dashboard");
  }

  const [subscription, mentorship] = await Promise.all([
    getSubscriptionByUserId(user.id),
    getMentorshipByMentee(user.id),
  ]);

  const mentor =
    mentorship &&
    (await getUserById(mentorship.mentor_id));

  const plan =
    subscription &&
    (await getPlanById(subscription.plan_id));

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Welcome, {profile.full_name}
        </h1>

        <p className={styles.subtitle}>
          Your mentee dashboard
        </p>
      </div>

      <div className={styles.grid}>
        {/* Subscription */}

        <div className={styles.card}>
          <div className={styles.cardLabel}>
            Subscription
          </div>

          {subscription ? (
            <>
              <div className={styles.cardValue}>
                {plan?.name}
              </div>

              <div
                className={`${styles.badge} ${
                  styles[`badge-${subscription.status}`]
                }`}
              >
                {subscription.status}
              </div>
            </>
          ) : (
            <>
              <div className={styles.cardValue}>
                No active plan
              </div>
            </>
          )}
        </div>

        {/* Mentor */}

        <div className={styles.card}>
          <div className={styles.cardLabel}>
            Your Mentor
          </div>

          {mentor ? (
            <>
              <div className={styles.mentorAvatar}>
                {mentor.full_name?.charAt(0)}
              </div>

              <div className={styles.mentorName}>
                {mentor.full_name}
              </div>

              <div className={styles.cardMeta}>
                {mentor.expertise}
              </div>
            </>
          ) : (
            <>
              <div className={styles.cardValue}>
                Not Assigned
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}