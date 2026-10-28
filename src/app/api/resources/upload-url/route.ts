import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeFileName, uploadPrefix } from "@/lib/resources/files";
import { requireSharer } from "@/lib/resources/share";

const schema = z.object({ fileName: z.string().min(1).max(300) });

/**
 * Hands out a one-time signed upload URL for the private `resources` bucket.
 * The browser uploads straight to storage, so large files never pass through
 * this server (Vercel caps function request bodies at ~4.5 MB).
 */
export async function POST(request: Request) {
  const sharer = await requireSharer();
  if (!sharer.ok) return sharer.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A file name is required." }, { status: 400 });
  }

  const path = `${uploadPrefix(sharer.role, sharer.userId)}${Date.now()}-${sanitizeFileName(
    parsed.data.fileName
  )}`;

  const { data, error } = await createAdminClient()
    .storage.from("resources")
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("[resources/upload-url]", error);
    return NextResponse.json({ error: "Could not start the upload." }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
