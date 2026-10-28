import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMenteeAccess } from "@/lib/access";
import { getResourcesForUser, getUploaders } from "@/lib/models/resources";
import LockedFeature from "@/components/dashboard/LockedFeature";
import ResourceGrid, { ResourceSection } from "@/components/dashboard/ResourceGrid";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resources | Mentee",
};

export default async function MenteeResourcesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return <LockedFeature feature="Resources" reason={access.reason} />;
  }

  const resources = await getResourcesForUser(user.id);
  const uploaders = await getUploaders(resources);
  const fromM2D = resources.filter(
    (r) => uploaders.get(r.uploaded_by)?.role === "admin"
  );
  const fromMentors = resources.filter((r) => !fromM2D.includes(r));

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
        <ResourceGrid resources={[]} emptyText="No resources are available yet." />
      ) : (
        <>
          {fromM2D.length > 0 && (
            <ResourceSection title="From Mothers to Daughters">
              <ResourceGrid resources={fromM2D} emptyText="" />
            </ResourceSection>
          )}
          {fromMentors.length > 0 && (
            <ResourceSection title="From mentors">
              <ResourceGrid
                resources={fromMentors}
                emptyText=""
                meta={(r) => {
                  const name = uploaders.get(r.uploaded_by)?.name;
                  return name ? [`Shared by ${name}`] : [];
                }}
              />
            </ResourceSection>
          )}
        </>
      )}
    </div>
  );
}
