import { getAllResources } from "@/lib/models/resources";
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
    </div>
  );
}