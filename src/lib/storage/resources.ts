import { createClient } from "@/lib/supabase/client";

export async function uploadResourceFile(file: File) {
  const supabase = createClient();

  const extension = file.name.split(".").pop();

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage
    .from("resources")
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  return filePath;
}

export async function deleteResourceFile(path: string) {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from("resources")
    .remove([path]);

  if (error) {
    throw error;
  }
}