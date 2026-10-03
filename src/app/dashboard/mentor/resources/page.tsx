import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMentorResourceView } from "@/lib/models/resources";
import UploadResource from "./UploadResource";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resources | Mentor",
};

const typeIcons: Record<string, string> = {
  document: "📄",
  video: "🎥",
  audio: "🎵",
  link: "🔗",
  other: "📦",
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

      <UploadResource />

      {resources.length === 0 ? (
        <div className={styles.empty}>
          No resources are available yet.
        </div>
      ) : (
        <div className={styles.grid}>
          {resources.map((resource) => (
            <div key={resource.id} className={styles.card}>
              <div className={styles.icon}>
                {typeIcons[resource.type] ?? "📦"}
              </div>

              <h2 className={styles.resourceTitle}>
                {resource.title}
              </h2>

              {resource.uploaded_by === user.id &&
                resource.visibility === "mentee_only" && (
                  <span className={styles.sharedBadge}>
                    Shared with mentees
                  </span>
                )}

              {resource.description && (
                <p className={styles.resourceDesc}>
                  {resource.description}
                </p>
              )}

              <div className={styles.meta}>
                <span>
                  {typeIcons[resource.type] ?? "📄"}{" "}
                  {resource.type.charAt(0).toUpperCase() +
                    resource.type.slice(1)}
                </span>

                <span>
                  📂 {resource.category || "General"}
                </span>
              </div>

              <a
                href={`/api/resources/${resource.id}/download`}
                className={styles.downloadButton}
              >
                ⬇ Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}