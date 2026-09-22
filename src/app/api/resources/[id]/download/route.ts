import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResourceById } from "@/lib/models/resources";
import { createAuditLog } from "@/lib/audit";

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

  const { data, error: signedError } = await supabase.storage
    .from("resources")
    .createSignedUrl(resource.file_url, 60);

  if (signedError) {
    return NextResponse.json(
      { error: signedError.message },
      { status: 500 }
    );
  }

  await supabase
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

  return NextResponse.redirect(data.signedUrl);
}