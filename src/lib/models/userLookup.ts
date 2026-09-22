import { createClient } from "@/lib/supabase/server";

export interface UserLookup {
  id: string;
  full_name: string | null;
}

export async function getUserLookup(): Promise<UserLookup[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, full_name");

  if (error) {
    throw error;
  }

  return (data ?? []) as UserLookup[];
}