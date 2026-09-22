import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResourcesForUser } from "@/lib/models/resources";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resources | Mentee",
};

const typeIcons: Record<string, string> = {
  document: "📄",
  video: "🎥",
  audio: "🎵",
  link: "🔗",
  other: "📦",
};

export default async function MenteeResourcesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resources = await getResourcesForUser(user.id);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Resources</h1>

        <p className={styles.subtitle}>
          Guides, materials, and resources to support your mentorship
          journey.
        </p>
      </div>

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