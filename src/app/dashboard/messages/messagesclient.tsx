"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

import styles from "./page.module.css";

interface Conversation {
  id: string;
  mentorship_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Message {
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

interface Props {
  conversations: Conversation[];
}

interface UserProfile {
  id: string;
  full_name: string | null;
  email?: string | null;
  role?: string | null;
}

async function getMessages(
  supabase: ReturnType<typeof createClient>,
  conversationId: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await assertConversationMember(
    supabase,
    conversationId,
    user.id
  );

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

async function sendMessage(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
  message: string
) {
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

  await assertConversationMember(
    supabase,
    conversationId,
    user.id
  );

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

async function markMessagesAsRead(
  supabase: ReturnType<typeof createClient>,
  conversationId: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await assertConversationMember(
    supabase,
    conversationId,
    user.id
  );

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
}

async function assertConversationMember(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
  userId: string
) {
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    throw new Error("You do not have access to this conversation.");
  }
}

export default function MessagesClient({
  conversations,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [selectedConversation, setSelectedConversation] =
    useState<string | null>(
      conversations.length > 0
        ? conversations[0].id
        : null
    );

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<
    string | null
  >(null);
  const [profiles, setProfiles] = useState<
    Record<string, UserProfile>
  >({});

  const [messageText, setMessageText] = useState("");
  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] = useState("");

  const currentConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id === selectedConversation
      ),
    [conversations, selectedConversation]
  );

  /* =======================================================
     Load current user
  ======================================================= */

  useEffect(() => {
    async function loadCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);
    }

    loadCurrentUser();
  }, [supabase]);

  /* =======================================================
     Load messages
  ======================================================= */

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const conversationId = selectedConversation;
    let cancelled = false;

    async function loadMessages() {
      setLoadingMessages(true);
      setError("");

      try {
        const data = await getMessages(
          supabase,
          conversationId
        );

        if (!cancelled) {
          setMessages(data);
        }

        await markMessagesAsRead(
          supabase,
          conversationId
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load messages."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedConversation, supabase]);

  /* =======================================================
     Load user profiles for message senders
  ======================================================= */

  useEffect(() => {
    const senderIds = [
      ...new Set(
        messages.map(
          (message) => message.sender_id
        )
      ),
    ];

    if (senderIds.length === 0) return;

    async function loadProfiles() {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, full_name, role")
        .in("id", senderIds);

      if (error) {
        console.error(
          "Unable to load profiles:",
          error
        );
        return;
      }

      const profileMap: Record<
        string,
        UserProfile
      > = {};

      data?.forEach((profile) => {
        profileMap[profile.id] = profile;
      });

      setProfiles((previous) => ({
        ...previous,
        ...profileMap,
      }));
    }

    loadProfiles();
  }, [messages, supabase]);

  /* =======================================================
     Send message
  ======================================================= */

  function handleSendMessage() {
    const text = messageText.trim();

    if (!text || !selectedConversation) {
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        const newMessage = await sendMessage(
          supabase,
          selectedConversation,
          text
        );

        setMessages((previous) => [
          ...previous,
          newMessage,
        ]);

        setMessageText("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to send message."
        );
      }
    });
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Messages
        </h1>

        <p className={styles.subtitle}>
          Communicate privately with your
          mentorship connections.
        </p>
      </div>

      <div className={styles.messagingLayout}>
        {/* =================================================
            Conversation List
        ================================================= */}

        <aside className={styles.conversations}>
          <div className={styles.conversationsHeader}>
            <h2>Conversations</h2>
          </div>

          {conversations.length === 0 ? (
            <div className={styles.emptyConversations}>
              <p>No conversations yet.</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`${styles.conversationItem} ${
                  selectedConversation ===
                  conversation.id
                    ? styles.conversationActive
                    : ""
                }`}
                onClick={() =>
                  setSelectedConversation(
                    conversation.id
                  )
                }
              >
                <div className={styles.conversationAvatar}>
                  💬
                </div>

                <div
                  className={
                    styles.conversationInfo
                  }
                >
                  <div
                    className={
                      styles.conversationName
                    }
                  >
                    Mentorship Conversation
                  </div>

                  <div
                    className={
                      styles.conversationMeta
                    }
                  >
                    Open conversation
                  </div>
                </div>
              </button>
            ))
          )}
        </aside>

        {/* =================================================
            Chat Window
        ================================================= */}

        <section className={styles.chat}>
          {!currentConversation ? (
            <div className={styles.noConversation}>
              <div className={styles.noConversationIcon}>
                💬
              </div>

              <h2>No conversation selected</h2>

              <p>
                Your mentorship conversations
                will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.chatHeader}>
                <div
                  className={styles.chatAvatar}
                >
                  💬
                </div>

                <div>
                  <h2>
                    Mentorship Conversation
                  </h2>

                  <p>
                    Private mentor-mentee chat
                  </p>
                </div>
              </div>

              <div className={styles.messageArea}>
                {loadingMessages ? (
                  <div
                    className={
                      styles.loadingMessages
                    }
                  >
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    className={
                      styles.emptyMessages
                    }
                  >
                    <div>👋</div>

                    <h3>
                      Start the conversation
                    </h3>

                    <p>
                      Send a message to begin
                      communicating.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      profile={
                        profiles[
                          message.sender_id
                        ]
                      }
                      currentUserId={currentUserId}
                      formatTime={formatTime}
                    />
                  ))
                )}
              </div>

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              <div className={styles.inputArea}>
                <textarea
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(
                      event.target.value
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message..."
                  rows={1}
                  disabled={isPending}
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={
                    isPending ||
                    !messageText.trim()
                  }
                >
                  {isPending
                    ? "Sending..."
                    : "Send"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   Message Bubble
========================================================= */

function MessageBubble({
  message,
  profile,
  currentUserId,
  formatTime,
}: {
  message: Message;
  profile?: UserProfile;
  currentUserId: string | null;
  formatTime: (date: string) => string;
}) {
  const isOwn =
    currentUserId === message.sender_id;

  return (
    <div
      className={`${styles.messageRow} ${
        isOwn
          ? styles.messageRowOwn
          : styles.messageRowOther
      }`}
    >
      <div
        className={`${styles.messageBubble} ${
          isOwn
            ? styles.messageBubbleOwn
            : styles.messageBubbleOther
        }`}
      >
        {!isOwn && (
          <div className={styles.senderName}>
            {profile?.full_name ?? "User"}
          </div>
        )}

        <div className={styles.messageText}>
          {message.message}
        </div>

        <div className={styles.messageTime}>
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
}