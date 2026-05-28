import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, description, accent }: StatCardProps) {
  return (
    <div className={`${styles.card} ${accent ? styles.accent : ''}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  );
}
