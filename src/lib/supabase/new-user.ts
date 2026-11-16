import type { createAdminClient } from "./admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Save the profile row for a just-created auth user. Upserts because a database
 * trigger on auth.users may already have created the row; inserting again
 * would fail with a duplicate key and leave a half-created account.
 */
export async function saveNewUserProfile(
  admin: AdminClient,
  profile: { id: string } & Record<string, unknown>
) {
  return admin.from("user_profiles").upsert(profile, { onConflict: "id" });
}

/**
 * Undo a half-created account. The profile row goes first: if it references
 * auth.users, deleting the auth user while it exists fails, which would leave
 * the email "already registered" with no way to sign in.
 */
export async function rollbackNewUser(admin: AdminClient, userId: string) {
  const { error: profileError } = await admin.from("user_profiles").delete().eq("id", userId);
  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (profileError || authError) {
    console.error("[rollbackNewUser]", userId, profileError ?? authError);
  }
}
