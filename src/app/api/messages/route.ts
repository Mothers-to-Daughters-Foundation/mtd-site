import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Send a message in a conversation and notify the other member(s).
 *
 * Membership is checked and the insert runs with the service role, so this
 * works regardless of the messages RLS policies. Also creates a `new_message`
 * notification for the other member(s) so the header bell (fix #2) updates.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let conversationId: string;
  let message: string;
  try {
    const body = await request.json();
    conversationId = String(body.conversationId ?? "");
    message = String(body.message ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!conversationId || !message) {
    return NextResponse.json(
      { error: "Conversation and message are required." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Enforce membership (don't rely on RLS here).
  const { data: membership } = await admin
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: "You do not have access to this conversation." },
      { status: 403 }
    );
  }

  const { data: inserted, error: insertError } = await admin
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      message,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[messages POST]", insertError);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }

  // Notify the other member(s).
  const { data: others } = await admin
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("is_active", true)
    .neq("user_id", user.id);

  if (others && others.length > 0) {
    const { data: sender } = await admin
      .from("user_profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const senderName = sender?.full_name ?? "Someone";

    await admin.from("notifications").insert(
      others.map((m) => ({
        user_id: m.user_id,
        type: "new_message",
        title: "New message",
        message: `${senderName} sent you a message.`,
        related_id: conversationId,
      }))
    );
  }

  return NextResponse.json(inserted);
}
