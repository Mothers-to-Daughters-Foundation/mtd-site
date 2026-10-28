import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAuditLog } from "@/lib/audit";
import { isExternalResource } from "@/lib/resources/files";
import { requireSharer } from "@/lib/resources/share";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Remove a resource and its file. Admins can remove any; mentors their own. */
export async function DELETE(_request: Request, { params }: RouteContext) {
  const sharer = await requireSharer();
  if (!sharer.ok) return sharer.response;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: resource } = await admin
    .from("resources")
    .select("id, title, type, file_url, uploaded_by")
    .eq("id", id)
    .maybeSingle();

  if (!resource) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }
  if (sharer.role !== "admin" && resource.uploaded_by !== sharer.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await admin.from("resources").delete().eq("id", id);
  if (error) {
    console.error("[resources DELETE]", error);
    return NextResponse.json({ error: "Failed to delete resource." }, { status: 500 });
  }

  if (!isExternalResource(resource)) {
    const { error: storageError } = await admin.storage
      .from("resources")
      .remove([resource.file_url]);
    if (storageError) console.error("[resources DELETE storage]", storageError);
  }

  await createAuditLog({
    userId: sharer.userId,
    action: "delete",
    tableName: "resources",
    recordId: resource.id,
    description: `Deleted "${resource.title}"`,
  });

  return NextResponse.json({ ok: true });
}
