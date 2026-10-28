import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllResources, getUploaders } from "@/lib/models/resources";
import { AUDIENCE_LABELS, type ShareAudience } from "@/lib/resources/audience";
import ResourceUploader from "@/components/dashboard/ResourceUploader";
import ResourceGrid from "@/components/dashboard/ResourceGrid";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resources | Admin",
};

export default async function AdminResourcesPage() {
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

  const resources = await getAllResources();
  const uploaders = await getUploaders(resources);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Resources</h1>

        <p className={styles.subtitle}>
          Drop in materials for the whole community. Files and links shared
          here appear at the top of every mentee&apos;s Resources page, and
          everyone in the audience is notified.
        </p>
      </div>

      <ResourceUploader heading="Share materials" canChooseAudience />

      <h2 className={styles.sectionTitle}>
        All resources ({resources.length})
      </h2>

      <ResourceGrid
        resources={resources}
        emptyText="Nothing has been shared yet."
        badge={(r) =>
          AUDIENCE_LABELS[r.visibility as ShareAudience] ?? "Private"
        }
        meta={(r) => [
          `By ${uploaders.get(r.uploaded_by)?.name ?? "Unknown"}`,
          `${r.download_count} ${r.download_count === 1 ? "open" : "opens"}`,
          new Date(r.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        ]}
        canDelete={() => true}
      />
    </div>
  );
}
