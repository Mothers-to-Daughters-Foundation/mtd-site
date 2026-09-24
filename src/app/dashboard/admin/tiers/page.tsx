import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { getAllPlans } from "@/lib/supabase/plans";

import TierEditor from "@/components/dashboard/TierEditor";
import styles from "./page.module.css";

export const metadata = {
  title: "Subscription Tiers | Admin",
};

export default async function AdminTiersPage() {
  const supabase = await createClient();

  // Get current logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the user's role from user_profiles
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const plans = await getAllPlans();

  const serialized = plans.map((plan) => ({
    _id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description ?? "",
    pricePerMonth: plan.monthly_price,
    features: [],
    isActive: plan.is_active,
    isDefault: false,
    stripePriceId: "",
    zeffyUrl: "",
    maxMentees: plan.mentor_limit,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at,
  }));

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Subscription Tiers</h1>
        <p className={styles.subtitle}>
          Create and edit pricing tiers. Changes take effect immediately.
        </p>
      </div>

      <TierEditor tiers={serialized} />
    </div>
  );
}