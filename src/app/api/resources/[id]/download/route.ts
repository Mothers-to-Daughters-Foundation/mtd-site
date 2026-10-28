import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResourceById } from "@/lib/models/resources";
import { isExternalResource } from "@/lib/resources/files";
import { createAuditLog } from "@/lib/audit";
import { getMenteeAccess } from "@/lib/access";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const resource = await getResourceById(id);

  if (!resource) {
    return NextResponse.json(
      { error: "Resource not found." },
      { status: 404 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "User profile not found." },
      { status: 403 }
    );
  }

  const canAccess =
    profile.role === "admin" ||
    resource.uploaded_by === user.id ||
    resource.visibility === "public" ||
    (profile.role === "mentor" &&
      resource.visibility === "mentor_only") ||
    (profile.role === "mentee" &&
      resource.visibility === "mentee_only");

  if (!canAccess) {
    return NextResponse.json(
      { error: "You do not have permission to access this resource." },
      { status: 403 }
    );
  }

  // Access is checked above, so the service role signs the URL and bumps the
  // count; the private bucket and table RLS would otherwise block mentees.
  const admin = createAdminClient();

  let target = resource.file_url;
  if (!isExternalResource(resource)) {
    const { data, error: signedError } = await admin.storage
      .from("resources")
      .createSignedUrl(resource.file_url, 60);

    if (signedError || !data) {
      console.error("[resources download]", signedError);
      return NextResponse.json(
        { error: "Could not open this file." },
        { status: 500 }
      );
    }
    target = data.signedUrl;
  }

  await admin
    .from("resources")
    .update({
      download_count: resource.download_count + 1,
    })
    .eq("id", resource.id);

  await createAuditLog({
    userId: user.id,
    action: "download",
    tableName: "resources",
    recordId: resource.id,
    description: `Downloaded "${resource.title}"`,
  });

  return NextResponse.redirect(target);
}
