import { createClient } from "@/lib/supabase/server";

export interface UserLookup {
  id: string;
  full_name: string | null;
}

export async function getUserLookup(ids: string[]): Promise<UserLookup[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .in("id", ids);

  if (error) {
    throw error;
  }

  return (data ?? []) as UserLookup[];
}