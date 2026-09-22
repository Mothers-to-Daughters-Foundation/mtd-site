"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { useNotifications } from "@/providers/NotificationProvider";

import styles from "./DashboardSidebar.module.css";

const supabase = createClient();

const adminNav = [
  { href: "/dashboard/admin", label: "Overview", exact: true },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/tiers", label: "Subscription Tiers" },
  { href: "/dashboard/admin/matches", label: "Matches" },
  { href: "/dashboard/admin/subscriptions", label: "Subscriptions" },
  { href: "/dashboard/admin/resources", label: "Resources" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

const mentorNav = [
  { href: '/dashboard/mentor', label: 'Overview', exact: true },
  { href: '/dashboard/mentor/mentees', label: 'My Mentees' },
  { href: '/dashboard/mentor/sessions', label: 'Sessions' },
  { href: '/dashboard/mentor/resources', label: 'Resources' },
  { href: "/dashboard/messages", label: "Messages" },
  { href: '/dashboard/mentor/profile', label: 'Profile' },
  { href: '/dashboard/notifications', label: 'Notifications' },
];

const menteeNav = [
  { href: '/dashboard/mentee', label: 'Overview', exact: true },
  { href: '/dashboard/mentee/subscription', label: 'Subscription' },
  { href: '/dashboard/mentee/sessions', label: 'Sessions' },
  { href: '/dashboard/mentee/resources', label: 'Resources' },
  { href: '/dashboard/mentee/profile', label: 'Profile' },
  { href: "/dashboard/messages", label: "Messages" },
  { href: '/dashboard/notifications', label: 'Notifications' },
];

function NavItem({
  href,
  label,
  exact,
  unreadCount,
}: {
  href: string;
  label: string;
  exact?: boolean;
  unreadCount: number;
}) {
  const pathname = usePathname();

  const isActive = exact
    ? pathname === href
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`${styles.navItem} ${
        isActive ? styles.navItemActive : ""
      }`}
    >
      <span>{label}</span>

      {label === "Notifications" && unreadCount > 0 && (
        <span className={styles.badge}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

export default function DashboardSidebar() {
  const router = useRouter();

  const { unreadCount } = useNotifications();

  const [user, setUser] = useState<any>(null);

  const [role, setRole] = useState<
    "admin" | "mentor" | "mentee"
  >("mentee");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUser(user);

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && profile?.role) {
        setRole(profile.role);
      }
    }

    loadUser();
  }, [router]);

  const navItems =
    role === "admin"
      ? adminNav
      : role === "mentor"
      ? mentorNav
      : menteeNav;

  const roleLabel =
    role === "admin"
      ? "Admin"
      : role === "mentor"
      ? "Mentor"
      : "Mentee";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Link href="/" className={styles.brandLink}>
          MTD
        </Link>

        <span className={styles.roleTag}>
          {roleLabel}
        </span>
      </div>

      {user && (
        <div className={styles.userInfo}>
          <div className={styles.userName}>
            {user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              "User"}
          </div>

          <div className={styles.userEmail}>
            {user.email}
          </div>
        </div>
      )}

      <nav
        className={styles.nav}
        aria-label="Dashboard Navigation"
      >
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            unreadCount={unreadCount}
          />
        ))}
      </nav>

      <div className={styles.bottom}>
        <Link href="/" className={styles.siteLink}>
          ← Back to site
        </Link>

        <button
          type="button"
          className={styles.signOutBtn}
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}