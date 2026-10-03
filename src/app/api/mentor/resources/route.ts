import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ResourceType } from "@/lib/models/resources";

function resourceTypeFromMime(mime: string): ResourceType {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime === "application/pdf" ||
    mime.includes("word") ||
    mime.includes("document") ||
    mime.includes("sheet") ||
    mime.includes("presentation") ||
    mime.startsWith("text/")
  ) {
    return "document";
  }
  return "other";
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

/**
 * Lets a mentor share a resource that every mentee receives.
 * Upload + inserts run with the service role so they bypass the private
 * `resources` bucket and table RLS (no extra storage/table policy needed).
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const title = (form.get("title") as string | null)?.trim();
    const description =
      (form.get("description") as string | null)?.trim() || null;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "A title is required." }, { status: 400 });
    }

    const admin = createAdminClient();

    const path = `mentor-uploads/${user.id}/${Date.now()}-${sanitizeFileName(
      file.name
    )}`;

    const { error: uploadError } = await admin.storage
      .from("resources")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("[mentor/resources upload]", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file." },
        { status: 500 }
      );
    }

    const { data: resource, error: insertError } = await admin
      .from("resources")
      .insert({
        uploaded_by: user.id,
        title,
        description,
        type: resourceTypeFromMime(file.type || ""),
        file_url: path,
        thumbnail_url: null,
        visibility: "mentee_only",
        category: null,
        tags: null,
        download_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[mentor/resources insert]", insertError);
      return NextResponse.json(
        { error: "Failed to save resource." },
        { status: 500 }
      );
    }

    // Notify every mentee so the header bell (fix #2) can surface it.
    const { data: mentees } = await admin
      .from("user_profiles")
      .select("id")
      .eq("role", "mentee");

    if (mentees && mentees.length > 0) {
      await admin.from("notifications").insert(
        mentees.map((m) => ({
          user_id: m.id,
          type: "resource",
          title: "New resource shared",
          message: `A mentor shared "${title}" with you.`,
          related_id: resource.id,
        }))
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("[mentor/resources POST]", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
