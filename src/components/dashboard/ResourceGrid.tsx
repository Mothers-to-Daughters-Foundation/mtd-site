import type { Resource } from '@/lib/models/resources';
import { isExternalResource } from '@/lib/resources/files';
import DeleteResourceButton from './DeleteResourceButton';
import styles from './ResourceGrid.module.css';

const typeIcons: Record<string, string> = {
  document: '📄',
  video: '🎥',
  audio: '🎵',
  link: '🔗',
  other: '📦',
};

interface ResourceGridProps {
  resources: Resource[];
  emptyText: string;
  /** Optional pill shown above the title (e.g. "From M2D"). */
  badge?: (resource: Resource) => string | null;
  /** Extra meta line items (e.g. uploader, audience, downloads). */
  meta?: (resource: Resource) => string[];
  canDelete?: (resource: Resource) => boolean;
}

export default function ResourceGrid({
  resources,
  emptyText,
  badge,
  meta,
  canDelete,
}: ResourceGridProps) {
  if (resources.length === 0) {
    return <div className={styles.empty}>{emptyText}</div>;
  }

  return (
    <div className={styles.grid}>
      {resources.map((resource) => {
        const pill = badge?.(resource);
        const isLink = isExternalResource(resource);
        return (
          <div key={resource.id} className={styles.card}>
            <div className={styles.icon} aria-hidden="true">
              {typeIcons[isLink ? 'link' : resource.type] ?? '📦'}
            </div>

            {pill && <span className={styles.badge}>{pill}</span>}

            <h3 className={styles.resourceTitle}>{resource.title}</h3>

            {resource.description && (
              <p className={styles.resourceDesc}>{resource.description}</p>
            )}

            <div className={styles.meta}>
              <span>
                {isLink
                  ? 'Link'
                  : resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </span>
              {resource.category && <span>📂 {resource.category}</span>}
              {meta?.(resource).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className={styles.actions}>
              <a
                href={`/api/resources/${resource.id}/download`}
                className={styles.openButton}
                {...(isLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {isLink ? 'Open link ↗' : '⬇ Download'}
              </a>
              {canDelete?.(resource) && (
                <DeleteResourceButton id={resource.id} title={resource.title} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Wrap a group of resources under a heading. */
export function ResourceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}
