import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMentorResourceView } from "@/lib/models/resources";
import ResourceUploader from "@/components/dashboard/ResourceUploader";
import ResourceGrid from "@/components/dashboard/ResourceGrid";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resources | Mentor",
};

export default async function MentorResourcesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resources = await getMentorResourceView(user.id);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Resources</h1>

        <p className={styles.subtitle}>
          Guides, templates, and materials to help you be an effective
          mentor — and share your own with your mentees.
        </p>
      </div>

      <ResourceUploader heading="Share a resource with your mentees" />

      <ResourceGrid
        resources={resources}
        emptyText="No resources are available yet."
        badge={(r) =>
          r.uploaded_by === user.id && r.visibility === "mentee_only"
            ? "Shared with mentees"
            : null
        }
        canDelete={(r) => r.uploaded_by === user.id}
      />
    </div>
  );
}
