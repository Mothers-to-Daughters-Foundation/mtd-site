"use client";

import { useNotifications } from "@/providers/NotificationProvider";
import NotificationItem from "./NotificationItem";
import styles from "./page.module.css";

export default function NotificationsPage() {
  const { notifications } = useNotifications();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Notifications</h1>

          <p>
            Stay updated with everything happening on Mothers to Daughters.
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔔</div>

          <h2>No notifications</h2>

          <p>You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}