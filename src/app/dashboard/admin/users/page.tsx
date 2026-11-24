export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { getAllUsers } from "@/lib/supabase/users";
import { getAllPlans } from "@/lib/supabase/plans";
import { createAdminClient } from "@/lib/supabase/admin";

import UserTable from "@/components/dashboard/UserTable";
import CreateMentorForm from "@/components/dashboard/CreateMentorForm";

import styles from "./page.module.css";

export const metadata = {
  title: "Manage Users | Admin",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
  } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  const [users, plans, deactivated, currentSubs] = await Promise.all([
    getAllUsers(),
    getAllPlans(),
    // Empty until migration 0017 adds the column; the query just errors.
    admin
      .from("user_profiles")
      .select("id")
      .not("deactivated_at", "is", null)
      .then(({ data }) => new Set((data ?? []).map((r) => r.id as string))),
    admin
      .from("subscriptions")
      .select("user_id, plan_id, status")
      .eq("is_current", true)
      .then(
        ({ data }) =>
          new Map(
            (data ?? []).map((s) => [
              s.user_id as string,
              { planId: s.plan_id as string, status: s.status as string },
            ])
          )
      ),
  ]);

  const serializedUsers = users.map((u) => ({
    _id: u.id,

    name: u.full_name ?? "",

    email: u.email ?? "",

    role: u.role,

    deactivated: deactivated.has(u.id),

    createdAt: u.created_at,

    updatedAt: u.updated_at,

    profile: {
      phone: u.phone,
      location:
        [u.city, u.country].filter(Boolean).join(", "),
      expertise: u.expertise,
    },

    subscriptionTierId: currentSubs.get(u.id)?.planId ?? "",

    subscriptionStatus: currentSubs.get(u.id)?.status ?? "",
  }));

  const serializedPlans = plans.map((plan) => ({
    _id: plan.id,

    name: plan.name,

    slug: plan.slug,

    description: plan.description,

    pricePerMonth: plan.monthly_price,

    features: [],

    isActive: plan.is_active,

    isDefault: false,
  }));

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Users
        </h1>

        <p className={styles.subtitle}>
          {users.length} registered accounts
        </p>
      </div>

      <CreateMentorForm />

      <UserTable
        users={serializedUsers}
        tiers={serializedPlans}
        currentUserId={user.id}
      />
    </div>
  );
}