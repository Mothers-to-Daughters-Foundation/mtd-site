export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import StatusSelect from "./StatusSelect";
import styles from "./page.module.css";

export const metadata = { title: "Bug Reports | Admin" };

type Report = {
  id: string;
  user_id: string | null;
  contact_email: string | null;
  description: string;
  page_url: string | null;
  user_agent: string | null;
  viewport: string | null;
  status: string;
  created_at: string;
};

export default async function AdminBugReportsPage() {
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
  if (profile?.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bug_reports")
    .select("id, user_id, contact_email, description, page_url, user_agent, viewport, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<Report[]>();

  const reports = data ?? [];
  const ids = [...new Set(reports.map((r) => r.user_id).filter(Boolean))] as string[];
  const { data: people } = ids.length
    ? await admin.from("user_profiles").select("id, full_name, role").in("id", ids)
    : { data: [] as { id: string; full_name: string | null; role: string }[] };
  const names = new Map((people ?? []).map((p) => [p.id, p]));
  const open = reports.filter((r) => r.status === "new" || r.status === "in_progress").length;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Bug reports</h1>
        <p className={styles.subtitle}>
          {error
            ? "Could not load reports. Has migration 0016 been applied?"
            : `${open} open · ${reports.length} total. Sent from the 🐞 button in the site footer and dashboard sidebar.`}
        </p>
      </div>

      {reports.length === 0 && !error ? (
        <p className={styles.empty}>No reports yet.</p>
      ) : (
        <ul className={styles.list}>
          {reports.map((r) => {
            const who = r.user_id ? names.get(r.user_id) : undefined;
            return (
              <li key={r.id} className={styles.card}>
                <div className={styles.meta}>
                  <span>{new Date(r.created_at).toLocaleString()}</span>
                  <span>
                    {who ? `${who.full_name ?? "Unnamed"} (${who.role})` : "Signed out"}
                    {r.contact_email && ` · ${r.contact_email}`}
                  </span>
                  <StatusSelect id={r.id} initial={r.status} />
                </div>
                <p className={styles.description}>{r.description}</p>
                <p className={styles.context}>
                  {r.page_url && (
                    <a href={r.page_url} target="_blank" rel="noreferrer">
                      {r.page_url}
                    </a>
                  )}
                  {r.viewport && ` · ${r.viewport}`}
                </p>
                {r.user_agent && <p className={styles.context}>{r.user_agent}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
