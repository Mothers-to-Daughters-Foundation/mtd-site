import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAllUsers,
  getUsersByRole,
} from "@/lib/supabase/users";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const role = searchParams.get("role") as
      | "admin"
      | "mentor"
      | "mentee"
      | null;

    const users = role
      ? await getUsersByRole(role)
      : await getAllUsers();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[admin/users GET]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}