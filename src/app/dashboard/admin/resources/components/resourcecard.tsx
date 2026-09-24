import { Resource } from "@/lib/models/resources";
import styles from "../page.module.css";
import DeleteButton from "./deletebutton";
import EditDialog from "./editdialog";
import DownloadButton from "./downloadbutton";

interface Props {
  resource: Resource;
}

const visibilityLabels: Record<string, string> = {
  public: "Public",
  mentor_only: "Mentors Only",
  mentee_only: "Mentees Only",
  private: "Private",
};

const typeIcons: Record<string, string> = {
  document: "📄",
  video: "🎥",
  audio: "🎵",
  link: "🔗",
  other: "📦",
};

export default function ResourceCard({ resource }: Props) {
  const uploadedDate = new Date(resource.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>{resource.title}</h2>

          <span className={styles.visibility}>
            {visibilityLabels[resource.visibility] ?? resource.visibility}
          </span>
        </div>
      </div>

      {resource.description && (
        <p className={styles.description}>
          {resource.description}
        </p>
      )}

      <div className={styles.meta}>
        <span>
          {typeIcons[resource.type] ?? "📁"}{" "}
          {resource.type.charAt(0).toUpperCase() +
            resource.type.slice(1)}
        </span>

        <span>
          📂 {resource.category || "General"}
        </span>

        <span>
          📥 {resource.download_count} Downloads
        </span>
      </div>

      <div className={styles.footer}>
        <small>
          Uploaded {uploadedDate}
        </small>
      </div>

      <div className={styles.actions}>
    <DownloadButton id={resource.id} />

    <EditDialog resource={resource} />

    <DeleteButton id={resource.id} />
  </div>
    </div>
  );
}