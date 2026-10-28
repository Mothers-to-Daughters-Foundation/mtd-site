import { createAdminClient } from "@/lib/supabase/admin";

export type ResourceType =
  | "document"
  | "video"
  | "link"
  | "audio"
  | "other";

export type ResourceVisibility =
  | "public"
  | "mentor_only"
  | "mentee_only"
  | "private";

export interface Resource {
  id: string;
  uploaded_by: string;

  title: string;
  description: string | null;

  type: ResourceType;

  /** Storage path in the `resources` bucket, or the URL for `link` resources. */
  file_url: string;

  thumbnail_url: string | null;

  visibility: ResourceVisibility;

  category: string | null;

  tags: string | null;

  download_count: number;

  created_at: string;

  updated_at: string;
}

/*
 * Reads use the service role with explicit visibility filters. Callers check
 * who is asking first, so the result does not depend on how the table's RLS
 * policies treat `public` rows.
 */

/* =========================================================
   Get all resources (admin)
========================================================= */

export async function getAllResources(): Promise<Resource[]> {
  const { data, error } = await createAdminClient()
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Resource[];
}

/* =========================================================
   Resources available to a user, by role
   ---------------------------------------------------------
   Admin: everything. Mentor: public + mentor_only.
   Mentee: public + mentee_only.
========================================================= */

export async function getResourcesForUser(userId: string): Promise<Resource[]> {
  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  if (profile.role === "admin") {
    return getAllResources();
  }

  const visibility = profile.role === "mentor" ? "mentor_only" : "mentee_only";

  const { data, error } = await admin
    .from("resources")
    .select("*")
    .in("visibility", ["public", visibility])
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as Resource[];
}

/* =========================================================
   Mentor Resources view
   ---------------------------------------------------------
   public + mentor_only, plus everything the mentor uploaded
   themselves (including mentee_only files they shared).
========================================================= */

export async function getMentorResourceView(
  userId: string
): Promise<Resource[]> {
  const { data, error } = await createAdminClient()
    .from("resources")
    .select("*")
    .or(
      `visibility.eq.public,visibility.eq.mentor_only,uploaded_by.eq.${userId}`
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Resource[];
}

/* =========================================================
   Get one resource by ID
========================================================= */

export async function getResourceById(
  id: string
): Promise<Resource | null> {
  const { data, error } = await createAdminClient()
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Resource | null;
}

/* =========================================================
   Uploader names + roles, for labelling resource lists
========================================================= */

export interface Uploader {
  name: string;
  role: string;
}

export async function getUploaders(
  resources: Pick<Resource, "uploaded_by">[]
): Promise<Map<string, Uploader>> {
  const ids = Array.from(new Set(resources.map((r) => r.uploaded_by)));
  if (ids.length === 0) return new Map();

  const { data, error } = await createAdminClient()
    .from("user_profiles")
    .select("id, full_name, role")
    .in("id", ids);

  if (error) {
    console.error("[getUploaders]", error);
    return new Map();
  }

  return new Map(
    (data ?? []).map((u) => [
      u.id,
      { name: u.full_name ?? "Unknown", role: u.role },
    ])
  );
}
