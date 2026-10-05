import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

type AdminResult =
  | { ok: true; supabase: ServerClient; user: User }
  | { ok: false; response: NextResponse };

/**
 * Authorize an admin-only API route handler. Returns the authenticated admin's
 * Supabase client + user, or a ready-to-return 401/403 NextResponse.
 *
 *   const auth = await requireAdmin();
 *   if (!auth.ok) return auth.response;
 *   const { supabase, user } = auth;
 */
export async function requireAdmin(): Promise<AdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, supabase, user };
}
