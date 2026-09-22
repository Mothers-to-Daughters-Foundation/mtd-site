import { createClient } from "@/lib/supabase/server";

export type NotificationType =
  | "mentor_request"
  | "mentor_request_approved"
  | "mentor_request_rejected"
  | "mentorship_request"
  | "mentorship_created"
  | "session_scheduled"
  | "session_updated"
  | "session_cancelled"
  | "new_message"
  | "system"

  // New notifications
  | "resource"
  | "subscription"
  | "match";

interface CreateNotificationProps {
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  relatedId?: string | null;
}

/* -------------------------------------------------- */
/* Create notification for one user */
/* -------------------------------------------------- */

export async function createNotification({
  userId,
  type = "system",
  title,
  message,
  relatedId = null,
}: CreateNotificationProps) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
    });

  if (error) {
    console.error(error);
    throw error;
  }
}

/* -------------------------------------------------- */
/* Notify one user */
/* -------------------------------------------------- */

export async function notifyUser(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: string
) {
  return createNotification({
    userId,
    type,
    title,
    message,
    relatedId,
  });
}

/* -------------------------------------------------- */
/* Notify many users */
/* -------------------------------------------------- */

export async function notifyUsers(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: string
) {
  if (!userIds.length) return;

  const supabase = await createClient();

  const payload = userIds.map((id) => ({
    user_id: id,
    type,
    title,
    message,
    related_id: relatedId ?? null,
  }));

  const { error } = await supabase
    .from("notifications")
    .insert(payload);

  if (error) {
    console.error(error);
    throw error;
  }
}

/* -------------------------------------------------- */
/* Notify ALL users */
/* -------------------------------------------------- */

export async function notifyAllUsers(
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: string
) {
  console.log("========== NOTIFICATION START ==========");

  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("user_profiles")
    .select("id");

  console.log("USER QUERY");
  console.log(users);
  console.log(error);

  if (error) {
    throw error;
  }

  if (!users || users.length === 0) {
    console.log("NO USERS FOUND");
    return;
  }

  const payload = users.map((u) => ({
    user_id: u.id,
    type,
    title,
    message,
    related_id: relatedId ?? null,
  }));

  console.log("INSERT PAYLOAD");
  console.log(payload);

  const { data, error: insertError } = await supabase
    .from("notifications")
    .insert(payload)
    .select();

  console.log("INSERT RESULT");
  console.log(data);
  console.log(insertError);

  if (insertError) {
    throw insertError;
  }

  console.log("========== NOTIFICATION END ==========");
}


/* -------------------------------------------------- */
/* Get notifications */
/* -------------------------------------------------- */

export async function getNotifications(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data ?? [];
}

/* -------------------------------------------------- */
/* Unread count */
/* -------------------------------------------------- */

export async function getUnreadCount(userId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", {
      head: true,
      count: "exact",
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;

  return count ?? 0;
}

/* -------------------------------------------------- */
/* Mark one read */
/* -------------------------------------------------- */

export async function markNotificationRead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

/* -------------------------------------------------- */
/* Mark all read */
/* -------------------------------------------------- */

export async function markAllNotificationsRead(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}

/* -------------------------------------------------- */
/* Delete */
/* -------------------------------------------------- */

export async function deleteNotification(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) throw error;
}