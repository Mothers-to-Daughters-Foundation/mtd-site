export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllSubscriptions } from "@/lib/supabase/subscriptions";
import { getAllPlans } from "@/lib/supabase/plans";
import SubscriptionsManager, {
  type SubRow,
  type PlanOption,
} from "./SubscriptionsManager";

import styles from "./page.module.css";

export const metadata = { title: "Subscriptions | Admin" };

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const [subscriptions, plans] = await Promise.all([
    getAllSubscriptions(),
    getAllPlans(),
  ]);

  const rows: SubRow[] = (subscriptions ?? []).map((sub: any) => ({
    id: sub.id,
    userId: sub.user_id,
    userName: sub.user_profiles?.full_name ?? null,
    userEmail: sub.user_profiles?.email ?? null,
    planName: sub.plans?.name ?? null,
    billingCycle: sub.billing_cycle ?? null,
    status: sub.status,
    expiresAt: sub.expires_at ?? null,
    startedAt: sub.started_at ?? null,
  }));

  const planOptions: PlanOption[] = plans.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Subscriptions</h1>
        <p className={styles.subtitle}>{rows.length} total subscription records</p>
      </div>
      <SubscriptionsManager subscriptions={rows} plans={planOptions} />
    </div>
  );
}
