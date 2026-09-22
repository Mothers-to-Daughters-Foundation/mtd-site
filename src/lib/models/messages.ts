import { createClient } from "@/lib/supabase/server";

export interface Conversation {
  id: string;
  mentorship_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  is_read: boolean;
  read_at: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/* =========================================================
   Get conversations for the current user
========================================================= */

export async function getMyConversations() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: memberships, error: membershipError } =
    await supabase
      .from("conversation_members")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

  if (membershipError) {
    throw membershipError;
  }

  if (!memberships || memberships.length === 0) {
    return [];
  }

  const conversationIds = memberships.map(
    (membership) => membership.conversation_id
  );

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .in("id", conversationIds)
    .eq("is_active", true)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return conversations as Conversation[];
}

/* =========================================================
   Get conversation by ID
========================================================= */

export async function getConversationById(
  conversationId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: membership, error: membershipError } =
    await supabase
      .from("conversation_members")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    throw new Error("You do not have access to this conversation.");
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("is_active", true)
    .single();

  if (error) {
    throw error;
  }

  return conversation as Conversation;
}

/* =========================================================
   Get messages
========================================================= */

export async function getMessages(conversationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  /* Verify membership first */
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    throw new Error("You do not have access to this conversation.");
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("is_deleted", false)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data as Message[];
}

/* =========================================================
   Send message
========================================================= */

export async function sendMessage(
  conversationId: string,
  message: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error("Message cannot be empty.");
  }

  /* Verify active membership */
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    throw new Error("You do not have access to this conversation.");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      message: trimmedMessage,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Message;
}

/* =========================================================
   Mark messages as read
========================================================= */

export async function markMessagesAsRead(
  conversationId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  /* Verify membership */
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    throw new Error("You do not have access to this conversation.");
  }

  const { error } = await supabase
    .from("messages")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw error;
  }

  return true;
}