"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/models/notification";

const supabase = createClient();

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;

  setNotifications: React.Dispatch<
    React.SetStateAction<Notification[]>
  >;

  setUnreadCount: React.Dispatch<
    React.SetStateAction<number>
  >;
}

const NotificationContext =
  createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null =
      null;

    let cancelled = false;

    async function initializeNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      /*
       * Load the user's existing notifications.
       */
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) return;

      if (!error) {
        const loadedNotifications =
          (data as Notification[]) ?? [];

        setNotifications(loadedNotifications);

        setUnreadCount(
          loadedNotifications.filter(
            (notification) => !notification.is_read
          ).length
        );
      }

      /*
       * Create the Realtime channel only once for this
       * effect instance.
       */
      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            /*
             * When a notification changes, reload the user's
             * notifications so the UI always reflects the
             * current database state.
             */
            const { data: latest, error } = await supabase
              .from("notifications")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", {
                ascending: false,
              });

            if (error || cancelled) return;

            const updatedNotifications =
              (latest as Notification[]) ?? [];

            setNotifications(updatedNotifications);

            setUnreadCount(
              updatedNotifications.filter(
                (notification) => !notification.is_read
              ).length
            );
          }
        );

      /*
       * Subscribe only after the postgres_changes callback
       * has been registered.
       */
      channel.subscribe();
    }

    initializeNotifications();

    /*
     * IMPORTANT:
     * This is the actual React effect cleanup function.
     */
    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        setNotifications,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}