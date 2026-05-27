import styles from './page.module.css';

export const metadata = { title: 'Resources | Mentor' };

export default function MentorResourcesPage() {
  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Resources</h1>
        <p className={styles.subtitle}>
          Guides, templates, and materials to help you be an effective mentor.
        </p>
      </div>

      <div className={styles.grid}>
        {resources.map((r) => (
          <div key={r.title} className={styles.card}>
            <div className={styles.icon}>{r.icon}</div>
            <h2 className={styles.resourceTitle}>{r.title}</h2>
            <p className={styles.resourceDesc}>{r.description}</p>
            <span className={styles.comingSoon}>Coming Soon</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const resources = [
  {
    icon: '📋',
    title: 'Mentor Handbook',
    description: 'Your complete guide to the MTD mentorship program and expectations.',
  },
  {
    icon: '🗓️',
    title: 'Session Templates',
    description: 'Ready-to-use templates for planning and running mentee sessions.',
  },
  {
    icon: '🎯',
    title: 'Goal-Setting Worksheets',
    description: 'Help your mentees identify and track their personal goals.',
  },
  {
    icon: '💬',
    title: 'Communication Tips',
    description: 'Best practices for building a strong mentor-mentee relationship.',
  },
];
