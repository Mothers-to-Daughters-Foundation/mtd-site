import { NextRequest, NextResponse } from "next/server";
import {
  getAllUsers,
  getUsersByRole,
} from "@/lib/supabase/users";
import { requireAdmin } from "@/lib/auth-guards";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

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