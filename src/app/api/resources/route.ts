import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { resourceTypeFromMime, uploadPrefix } from "@/lib/resources/files";
import { notifyAudience, requireSharer } from "@/lib/resources/share";

const schema = z
  .object({
    title: z.string().trim().min(1, "A title is required.").max(200),
    description: z.string().trim().max(2000).optional(),
    audience: z.enum(["mentee_only", "mentor_only", "public"]).optional(),
    // Either a file already uploaded via /api/resources/upload-url …
    path: z.string().min(1).optional(),
    contentType: z.string().max(200).optional(),
    // … or an external link (video, doc, course page).
    url: z.string().trim().url().refine((u) => /^https?:\/\//i.test(u), "Links must start with http(s)://").optional(),
  })
  .refine((b) => Boolean(b.path) !== Boolean(b.url), {
    message: "Share either a file or a link.",
  });

/**
 * Share a resource. Admins choose the audience (default: all mentees);
 * mentors always share with mentees. Everyone in the audience is notified.
 * Writes use the service role, so no extra table/storage policies are needed.
 */
export async function POST(request: Request) {
  const sharer = await requireSharer();
  if (!sharer.ok) return sharer.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid resource." },
      { status: 400 }
    );
  }

  const body = parsed.data;
  const audience = sharer.role === "admin" ? body.audience ?? "mentee_only" : "mentee_only";
  const admin = createAdminClient();

  if (body.path) {
    if (!body.path.startsWith(uploadPrefix(sharer.role, sharer.userId))) {
      return NextResponse.json({ error: "Invalid file." }, { status: 400 });
    }
    // Confirm the upload actually landed before saving a row that points at it.
    const { error: missing } = await admin.storage
      .from("resources")
      .createSignedUrl(body.path, 10);
    if (missing) {
      return NextResponse.json({ error: "The upload did not finish. Please try again." }, { status: 400 });
    }
  }

  const row = {
    uploaded_by: sharer.userId,
    title: body.title,
    description: body.description || null,
    type: body.url ? "link" : resourceTypeFromMime(body.contentType ?? ""),
    file_url: body.url ?? body.path,
    thumbnail_url: null,
    visibility: audience,
    category: null,
    tags: null,
    download_count: 0,
  };

  let { data: resource, error } = await admin
    .from("resources")
    .insert(row)
    .select()
    .single();

  // If the database's type enum predates "link", store it as "other";
  // links are recognised by their http(s) URL either way.
  if (error?.code === "22P02" && row.type === "link") {
    ({ data: resource, error } = await admin
      .from("resources")
      .insert({ ...row, type: "other" })
      .select()
      .single());
  }

  if (error || !resource) {
    console.error("[resources POST]", error);
    return NextResponse.json({ error: "Failed to save resource." }, { status: 500 });
  }

  await notifyAudience(admin, audience, resource, sharer.role);

  return NextResponse.json(resource);
}
