import { createClient } from "@/lib/supabase/server";

export interface Resource {
  id: string;
  uploaded_by: string;

  title: string;
  description: string | null;

  type:
    | "document"
    | "video"
    | "link"
    | "audio"
    | "other";

  file_url: string;

  thumbnail_url: string | null;

  visibility:
  | "public"
  | "mentor_only"
  | "mentee_only"
  | "private";

  category: string | null;

  tags: string | null;

  download_count: number;

  created_at: string;

  updated_at: string;
}

/* ----------------------------- */
/* Get all resources */
/* ----------------------------- */

export async function getAllResources() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as Resource[];
}

/* ----------------------------- */
/* Get resource by id */
/* ----------------------------- */

export async function getResourceById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;

  return data as Resource;
}

/* ----------------------------- */
/* Create */
/* ----------------------------- */

export async function createResource(
  resource: Omit<Resource, "id" | "created_at" | "updated_at">
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .insert(resource)
    .select()
    .single();

  if (error) throw error;

  return data as Resource;
}

/* ----------------------------- */
/* Update */
/* ----------------------------- */

export async function updateResource(
  id: string,
  updates: Partial<Resource>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as Resource;
}

/* ----------------------------- */
/* Delete */
/* ----------------------------- */

export async function deleteResource(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

/* ----------------------------- */
/* Increment Download Count */
/* ----------------------------- */

export async function incrementDownloadCount(id: string) {
  const resource = await getResourceById(id);

  if (!resource) return;

  await updateResource(id, {
    download_count: resource.download_count + 1,
  });
}


/* ----------------------------- */
/* Fetch and Filter Data */
/* ----------------------------- */
export async function getResourcesByVisibility(
  visibility:
    | "public"
    | "mentor_only"
    | "mentee_only"
    | "private"
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("visibility", visibility)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as Resource[];
}


export async function getRecentActivity(limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}