import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ShareAudience } from "./audience";
import type { SharerRole } from "./files";

type SharerResult =
  | { ok: true; userId: string; role: SharerRole }
  | { ok: false; response: NextResponse };

/** Resolve the signed-in user and confirm they may share resources. */
export async function requireSharer(): Promise<SharerResult> {
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

  if (profile?.role !== "admin" && profile?.role !== "mentor") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id, role: profile.role };
}

/** Notify everyone in the audience so the header bell can surface it. */
export async function notifyAudience(
  admin: SupabaseClient,
  audience: ShareAudience,
  resource: { id: string; title: string },
  sharerRole: SharerRole
) {
  const roles =
    audience === "public"
      ? ["mentee", "mentor"]
      : [audience === "mentor_only" ? "mentor" : "mentee"];

  const { data: recipients, error } = await admin
    .from("user_profiles")
    .select("id")
    .in("role", roles);

  if (error || !recipients || recipients.length === 0) {
    if (error) console.error("[notifyAudience]", error);
    return;
  }

  const who = sharerRole === "admin" ? "Mothers to Daughters" : "A mentor";
  await admin.from("notifications").insert(
    recipients.map((r) => ({
      user_id: r.id,
      type: "resource",
      title: "New resource shared",
      message: `${who} shared "${resource.title}" with you.`,
      related_id: resource.id,
    }))
  );
}
