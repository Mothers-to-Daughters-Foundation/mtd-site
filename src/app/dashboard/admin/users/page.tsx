export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { getAllUsers } from "@/lib/supabase/users";
import { getAllPlans } from "@/lib/supabase/plans";

import UserTable from "@/components/dashboard/UserTable";

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

  const [users, plans] = await Promise.all([
    getAllUsers(),
    getAllPlans(),
  ]);

  const serializedUsers = users.map((u) => ({
    _id: u.id,

    name: u.full_name ?? "",

    email: u.email ?? "",

    role: u.role,

    createdAt: u.created_at,

    updatedAt: u.updated_at,

    profile: {
      phone: u.phone,
      location:
        [u.city, u.country].filter(Boolean).join(", "),
      expertise: u.expertise,
    },

    subscriptionTierId: "",

    subscriptionStatus: "",
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

      <UserTable
        users={serializedUsers}
        tiers={serializedPlans}
      />
    </div>
  );
}