import { createAdminClient } from "./admin";
import { isExternalResource } from "@/lib/resources/files";

type AdminClient = ReturnType<typeof createAdminClient>;

/** Long enough to mean "until reactivated" (100 years). */
const BAN_FOREVER = "876000h";

export type GuardResult = { ok: true } | { ok: false; status: number; error: string };

/**
 * Admins can't deactivate, delete or demote themselves, and the last active
 * admin can't be removed, so the panel is never left without an admin.
 */
export async function checkCanRemove(
  admin: AdminClient,
  actorId: string,
  targetId: string
): Promise<GuardResult> {
  if (actorId === targetId) {
    return { ok: false, status: 400, error: "You can't do this to your own account." };
  }

  const { data: target } = await admin
    .from("user_profiles")
    .select("role")
    .eq("id", targetId)
    .maybeSingle();

  if (target?.role === "admin") {
    const { count } = await admin
      .from("user_profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .is("deactivated_at", null)
      .neq("id", targetId);
    if (!count) {
      return { ok: false, status: 400, error: "This is the last active admin. Make someone else an admin first." };
    }
  }

  return { ok: true };
}

/** Block or restore sign-in. Reversible; nothing is deleted. */
export async function setUserActive(admin: AdminClient, userId: string, active: boolean) {
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: active ? "none" : BAN_FOREVER,
  });
  if (authError) return { error: authError.message };

  const { error } = await admin
    .from("user_profiles")
    .update({ deactivated_at: active ? null : new Date().toISOString() })
    .eq("id", userId);
  if (error) {
    // Keep the two in step: undo the ban change if the profile didn't update.
    await admin.auth.admin.updateUserById(userId, {
      ban_duration: active ? BAN_FOREVER : "none",
    });
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Permanently delete a user: their data in every linked table (see migration
 * 0017), their uploaded files and avatar, then their Supabase sign-in.
 * Safe to run again if a step fails part way.
 */
export async function deleteUserCompletely(admin: AdminClient, userId: string) {
  // Note their uploaded files first; the rows are gone after the delete.
  const { data: uploads } = await admin
    .from("resources")
    .select("id, file_url")
    .eq("uploaded_by", userId);

  const { error: dataError } = await admin.rpc("admin_delete_user_data", { target: userId });
  if (dataError) return { error: dataError.message };

  // Remove stored files for resources that were deleted (not just unlinked).
  const fileRows = (uploads ?? []).filter((r) => !isExternalResource(r));
  if (fileRows.length) {
    const { data: left } = await admin
      .from("resources")
      .select("id")
      .in("id", fileRows.map((r) => r.id));
    const kept = new Set((left ?? []).map((r) => r.id));
    const paths = fileRows.filter((r) => !kept.has(r.id)).map((r) => r.file_url);
    if (paths.length) {
      const { error } = await admin.storage.from("resources").remove(paths);
      if (error) console.error("[deleteUserCompletely] resource files", error);
    }
  }

  const { data: avatarFiles } = await admin.storage.from("avatars").list(userId);
  if (avatarFiles?.length) {
    const { error } = await admin.storage
      .from("avatars")
      .remove(avatarFiles.map((f) => `${userId}/${f.name}`));
    if (error) console.error("[deleteUserCompletely] avatar", error);
  }

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError && !/not.?found/i.test(authError.message)) {
    return {
      error: `Their data was removed, but the sign-in could not be deleted (${authError.message}). Try again.`,
    };
  }

  return { error: null };
}
