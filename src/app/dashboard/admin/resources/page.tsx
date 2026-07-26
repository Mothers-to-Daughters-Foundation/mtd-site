import { getAllResources } from "@/lib/models/resources";
import ResourceCard from "./components/resourcecard";
import UploadDialog from "./components/uploaddialog";
import styles from "./page.module.css";
import ResourcesClient from "./resourcesclient";

export const metadata = {
  title: "Resources | Admin",
};

export default async function AdminResourcesPage() {
  const resources = await getAllResources();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Resources</h1>

          <p className={styles.subtitle}>
            Manage all mentorship resources.
          </p>
        </div>

        <UploadDialog />
      </div>

      <ResourcesClient resources={resources} />

      {resources.length === 0 ? (
        <div className={styles.empty}>
          No resources have been uploaded yet.
        </div>
      ) : (
        <div className={styles.grid}>
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
            />
          ))}
        </div>
      )}
    </div>
  );
}