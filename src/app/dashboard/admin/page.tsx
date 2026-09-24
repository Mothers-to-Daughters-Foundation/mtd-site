import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getRecentAuditLogs } from "@/lib/models/audit";
import { getUserLookup } from "@/lib/models/userLookup";
import styles from "./page.module.css";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const recentActivity = await getRecentAuditLogs(8);

const users = await getUserLookup();

const userMap = new Map(
  users.map((user) => [
    user.id,
    user.full_name ?? "Unknown User",
  ])
);

  const [
    usersResult,
    mentorsResult,
    menteesResult,
    resourcesResult,
    recentResources,
  ] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),

    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mentor"),

    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mentee"),

    supabase.from("resources").select("*", {
      count: "exact",
      head: true,

      


    }),

    supabase
      .from("resources")
      .select("id,title,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Welcome back. Here&apos;s what&apos;s happening inside MTD today.
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          title="Users"
          value={usersResult.count ?? 0}
        />

        <StatCard
          title="Mentors"
          value={mentorsResult.count ?? 0}
        />

        <StatCard
          title="Mentees"
          value={menteesResult.count ?? 0}
        />

        <StatCard
          title="Resources"
          value={resourcesResult.count ?? 0}
        />
      </div>


      <section className={styles.activitySection}>
  <h2 className={styles.sectionTitle}>Recent Activity</h2>

  <div className={styles.activityCard}>
    {recentActivity.length === 0 ? (
      <p className={styles.emptyActivity}>
        No recent activity.
      </p>
    ) : (
      <ul className={styles.activityList}>
        {recentActivity.map((activity) => (
          <li
            key={activity.id}
            className={styles.activityItem}
          >
            <div className={styles.activityIcon}>
              {getActivityIcon(activity.action)}
            </div>

            <div className={styles.activityContent}>
              <div className={styles.activityDescription}>
                <strong>
                  {userMap.get(activity.user_id ?? "") ?? "Unknown User"}
                </strong>{" "}
                • {activity.description}
              </div>

              <div className={styles.activityTime}>
                {formatRelativeTime(activity.created_at)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
</section>


      <div className={styles.sectionGrid}>
        <div className={styles.panel}>
          <h2>Recent Resources</h2>

          {recentResources.data?.length ? (
            <ul className={styles.resourceList}>
              {recentResources.data.map((resource) => (
                <li key={resource.id}>
                  {resource.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>No resources uploaded yet.</p>
          )}
        </div>

        <div className={styles.panel}>
          <h2>Quick Actions</h2>

          <div className={styles.actions}>
            <Link href="/dashboard/admin/users">
              Manage Users
            </Link>

            <Link href="/dashboard/admin/resources">
              Upload Resources
            </Link>

            <Link href="/dashboard/admin/subscriptions">
              Manage Subscriptions
            </Link>

            <Link href="/dashboard/admin/matches">
              Manage Matches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>

      <span>{value}</span>
    </div>
  );
}


function getActivityIcon(action: string) {
  switch (action.toLowerCase()) {
    case "create":
      return "🟢";

    case "update":
      return "✏️";

    case "delete":
      return "🗑️";

    case "download":
      return "⬇️";

    default:
      return "📌";
  }
}


function formatRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);

  const seconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";

  if (days < 7)
    return `${days} days ago`;

  return date.toLocaleDateString();
}