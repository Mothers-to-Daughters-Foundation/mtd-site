"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAuditLog } from "@/lib/audit";
import { notifyAllUsers } from "@/lib/notifications";

/* =======================================================
   Upload Resource
======================================================= */

export async function uploadResource(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const visibility = formData.get("visibility") as string;
  const type = formData.get("type") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    throw new Error("Please choose a file.");
  }

  const extension = file.name.split(".").pop();
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const storagePath = `uploads/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("resources")
    .upload(storagePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: resource, error: dbError } = await supabase
    .from("resources")
    .insert({
      uploaded_by: user.id,
      title,
      description: description || null,
      category: category || null,
      visibility,
      type,
      file_url: storagePath,
    })
    .select()
    .single();

  if (dbError) {
    await supabase.storage
      .from("resources")
      .remove([storagePath]);

    throw new Error(dbError.message);
  }

  await createAuditLog({
    userId: user.id,
    action: "create",
    tableName: "resources",
    recordId: resource.id,
    description: `Uploaded resource "${title}"`,
    newValues: {
      title,
      visibility,
      type,
    },
  });

  await notifyAllUsers(
    "resource",
    "New Resource Available",
    `"${title}" has been uploaded.`,
    resource.id
  );

  revalidatePath("/dashboard/admin/resources");

  return {
    success: true,
  };
}

/* =======================================================
   Update Resource
======================================================= */

export async function updateResource(
  id: string,
  data: {
    title: string;
    description?: string;
    category?: string;
    visibility: string;
    type: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("resources")
    .update({
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      visibility: data.visibility,
      type: data.type,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    tableName: "resources",
    recordId: id,
    description: `Updated resource "${data.title}"`,
    newValues: data,
  });

  await notifyAllUsers(
    "resource",
    "Resource Updated",
    `"${data.title}" has been updated.`,
    id
  );

  revalidatePath("/dashboard/admin/resources");

  return {
    success: true,
  };
}

/* =======================================================
   Delete Resource
======================================================= */

export async function deleteResource(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: resource, error: fetchError } = await supabase
    .from("resources")
    .select("title, file_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (resource.file_url) {
    await supabase.storage
      .from("resources")
      .remove([resource.file_url]);
  }

  const { error: deleteError } = await supabase
    .from("resources")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  await createAuditLog({
    userId: user.id,
    action: "delete",
    tableName: "resources",
    recordId: id,
    description: `Deleted resource "${resource.title}"`,
  });

  await notifyAllUsers(
    "resource",
    "Resource Removed",
    `"${resource.title}" has been removed from the resource library.`,
    id
  );

  revalidatePath("/dashboard/admin/resources");

  return {
    success: true,
  };
}

/* =======================================================
   Download Resource
======================================================= */

export async function getDownloadUrl(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: resource, error } = await supabase
    .from("resources")
    .select("title, file_url, download_count")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data, error: signedError } = await supabase.storage
    .from("resources")
    .createSignedUrl(resource.file_url, 60);

  if (signedError) {
    throw new Error(signedError.message);
  }

  await supabase
    .from("resources")
    .update({
      download_count: resource.download_count + 1,
    })
    .eq("id", id);

  await createAuditLog({
    userId: user.id,
    action: "download",
    tableName: "resources",
    recordId: id,
    description: `Downloaded "${resource.title}"`,
  });

  revalidatePath("/dashboard/admin/resources");

  return data.signedUrl;
}