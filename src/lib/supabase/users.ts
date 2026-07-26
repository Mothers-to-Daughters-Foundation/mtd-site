import { createClient } from "./server";

export interface AdminUser {
  id: string;

  email: string;

  full_name: string | null;

  role: "admin" | "mentor" | "mentee";

  status: string | null;

  phone: string | null;

  country: string | null;

  city: string | null;

  bio: string | null;

  avatar_url: string | null;

  expertise: string | null;

  availability: string | null;

  created_at: string;

  updated_at: string;
}
/**
 * Get every user profile
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<AdminUser | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;

  return data as AdminUser;
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  role: "admin" | "mentor" | "mentee"
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("role", role)
    .order("full_name");

  if (error) throw error;

  return data;
}

/**
 * Update a user's profile
 */
export async function updateUser(
  id: string,
  updates: Partial<AdminUser>
): Promise<AdminUser> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as AdminUser;
}

/**
 * Get the currently authenticated user's profile
 */
export async function getCurrentUserProfile(): Promise<AdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return data as AdminUser;
}