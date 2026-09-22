import { createClient } from "@/lib/supabase/server";

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

  file_url: string;

  thumbnail_url: string | null;

  visibility: ResourceVisibility;

  category: string | null;

  tags: string | null;

  download_count: number;

  created_at: string;

  updated_at: string;
}

/* =========================================================
   Get all resources
   ---------------------------------------------------------
   Intended for Admin use.
========================================================= */

export async function getAllResources(): Promise<Resource[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Resource[];
}


/* ----------------------------- */
/* Get resources available to current user */
/* ----------------------------- */

export async function getResourcesForUser(userId: string) {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  if (!profile) {
    throw new Error("User profile not found.");
  }

  if (profile.role === "admin") {
    return getAllResources();
  }

  const visibility =
    profile.role === "mentor"
      ? "mentor_only"
      : "mentee_only";

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .or(`visibility.eq.public,visibility.eq.${visibility}`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as Resource[];
}




/* =========================================================
   Get one resource by ID
========================================================= */

export async function getResourceById(
  id: string
): Promise<Resource | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
   Get resources accessible to Mentors
   ---------------------------------------------------------
   Mentor visibility:
   - public
   - mentor_only
========================================================= */

export async function getResourcesForMentor(): Promise<
  Resource[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .in("visibility", [
      "public",
      "mentor_only",
    ])
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Resource[];
}

/* =========================================================
   Get resources accessible to Mentees
   ---------------------------------------------------------
   Mentee visibility:
   - public
   - mentee_only
========================================================= */

export async function getResourcesForMentee(): Promise<
  Resource[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .in("visibility", [
      "public",
      "mentee_only",
    ])
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Resource[];
}

/* =========================================================
   Get resources by visibility
   ---------------------------------------------------------
   Kept for existing Admin functionality and any other
   existing callers that use the helper.
========================================================= */

export async function getResourcesByVisibility(
  visibility: ResourceVisibility
): Promise<Resource[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("visibility", visibility)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Resource[];
}

/* =========================================================
   Create
========================================================= */

export async function createResource(
  resource: Omit<
    Resource,
    "id" | "created_at" | "updated_at"
  >
): Promise<Resource> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .insert(resource)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Resource;
}

/* =========================================================
   Update
========================================================= */

export async function updateResource(
  id: string,
  updates: Partial<Resource>
): Promise<Resource> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Resource;
}

/* =========================================================
   Delete
========================================================= */

export async function deleteResource(
  id: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

/* =========================================================
   Increment Download Count
========================================================= */

export async function incrementDownloadCount(
  id: string
): Promise<void> {
  const resource = await getResourceById(id);

  if (!resource) {
    return;
  }

  await updateResource(id, {
    download_count:
      resource.download_count + 1,
  });
}

/* =========================================================
   Recent Audit Activity
========================================================= */

export async function getRecentActivity(
  limit = 10
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}