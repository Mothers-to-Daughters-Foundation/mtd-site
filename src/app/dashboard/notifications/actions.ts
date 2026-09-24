"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* -------------------------------------- */
/* Mark One Notification Read */
/* -------------------------------------- */

export async function markAsRead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/dashboard/notifications");
}

/* -------------------------------------- */
/* Mark All Read */
/* -------------------------------------- */

export async function markAllAsRead(userId: string) {
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

  revalidatePath("/dashboard/notifications");
}

/* -------------------------------------- */
/* Delete Notification */
/* -------------------------------------- */

export async function deleteNotification(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/dashboard/notifications");
}