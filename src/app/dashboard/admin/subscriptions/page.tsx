export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { getAllSubscriptions } from "@/lib/supabase/subscriptions";

import styles from "./page.module.css";

export const metadata = {
  title: "Subscriptions | Admin",
};

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const subscriptions = await getAllSubscriptions();

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Subscriptions</h1>

        <p className={styles.subtitle}>
          {subscriptions.length} total subscription records
        </p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Renewal</th>
              <th>Started</th>
            </tr>
          </thead>

          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  No subscriptions yet.
                </td>
              </tr>
            ) : (
              subscriptions.map((sub: any) => (
                <tr key={sub.id}>
                  <td>
                    <div className={styles.userName}>
                      {sub.user_profiles?.full_name}
                    </div>

                    <div className={styles.userEmail}>
                      {sub.user_profiles?.email}
                    </div>
                  </td>

                  <td>{sub.subscription_plans?.name}</td>

                  <td className={styles.capitalize}>
                    {sub.billing_cycle}
                  </td>

                  <td>
                    <span
                      className={`${styles.badge} ${
                        styles[`badge-${sub.status}`]
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>

                  <td>
                    {sub.expires_at
                      ? new Date(
                          sub.expires_at
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    {new Date(
                      sub.started_at
                    ).toLocaleDateString()}
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