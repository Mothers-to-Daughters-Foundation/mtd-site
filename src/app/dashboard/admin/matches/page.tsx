export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { getAllMentorships } from "@/lib/supabase/mentorships";
import { getAllUsers } from "@/lib/supabase/users";

import MatchManager from "@/components/dashboard/MatchManager";

import styles from "./page.module.css";

export const metadata = {
  title: "Matches | Admin",
};

export default async function AdminMatchesPage() {
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const [matches, users] = await Promise.all([
    getAllMentorships(),
    getAllUsers(),
  ]);

  const mentors = users
    .filter((u) => u.role === "mentor")
    .map((u) => ({
      id: u.id,
      name: u.full_name ?? "Unnamed Mentor",
      email: "",
    }));

  const mentees = users
    .filter((u) => u.role === "mentee")
    .map((u) => ({
      id: u.id,
      name: u.full_name ?? "Unnamed Mentee",
      email: "",
    }));

  const userMap = Object.fromEntries(
    users.map((u) => [
      u.id,
      {
        id: u.id,
        name: u.full_name ?? "Unknown User",
        email: "",
      },
    ])
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Mentor — Mentee Matches</h1>

        <p className={styles.subtitle}>
          Assign mentors to mentees and manage mentorships.
        </p>
      </div>

      <MatchManager
        matches={matches}
        mentors={mentors}
        mentees={mentees}
        userMap={userMap}
      />
    </div>
  );
}