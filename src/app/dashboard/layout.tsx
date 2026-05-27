'use client';

import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <DashboardSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
