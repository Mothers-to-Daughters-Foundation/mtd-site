"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { createClient } from "@/lib/supabase/client";

import styles from "./layout.module.css";

const supabase = createClient();

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // A deactivated account can't sign in again; this ends a session that
      // was already open when an admin deactivated it.
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("deactivated_at")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.deactivated_at) {
        await supabase.auth.signOut();
        router.replace("/login?deactivated=1");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className={styles.layout}>
        <DashboardSidebar />

        <main className={styles.main}>
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}