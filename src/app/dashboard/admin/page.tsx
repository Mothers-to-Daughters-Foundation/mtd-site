import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

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