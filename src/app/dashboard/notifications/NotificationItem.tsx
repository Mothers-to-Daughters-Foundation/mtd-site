"use client";

import {
  markAsRead,
  deleteNotification,
} from "./actions";

import { useNotifications } from "@/providers/NotificationProvider";
import type { Notification } from "@/lib/models/notification";

import styles from "./page.module.css";

interface Props {
  notification: Notification;
}

export default function NotificationItem({
  notification,
}: Props) {
  const {
    setNotifications,
    setUnreadCount,
  } = useNotifications();

  async function handleRead() {
    try {
      await markAsRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : item
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this notification?")) {
      return;
    }

    try {
      await deleteNotification(notification.id);

      setNotifications((current) =>
        current.filter(
          (item) => item.id !== notification.id
        )
      );

      if (!notification.is_read) {
        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error
      );
    }
  }

  return (
    <div
      className={`${styles.card} ${
        !notification.is_read
          ? styles.unread
          : ""
      }`}
    >
      <div className={styles.content}>
        <h3>{notification.title}</h3>

        <p>{notification.message}</p>

        <span>
          {new Date(
            notification.created_at
          ).toLocaleString()}
        </span>
      </div>

      <div className={styles.actions}>
        {!notification.is_read && (
          <button
            type="button"
            onClick={handleRead}
          >
            Mark Read
          </button>
        )}

        <button
          type="button"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}