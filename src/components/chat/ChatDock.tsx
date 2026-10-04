'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { createClient } from '@/lib/supabase/client';
import styles from './ChatDock.module.css';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type Thread = {
  id: string;
  otherName: string;
};

export default function ChatDock() {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();

  const [userId, setUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- load the user's conversations + unread count (graceful on error) ---
  const loadThreads = useCallback(
    async (uid: string) => {
      try {
        const { data: mine, error } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', uid)
          .eq('is_active', true);
        if (error) throw error;

        const ids = (mine ?? []).map((m) => m.conversation_id);
        if (ids.length === 0) {
          setThreads([]);
          setUnread(0);
          return;
        }

        const { data: others } = await supabase
          .from('conversation_members')
          .select('conversation_id, user_id')
          .in('conversation_id', ids)
          .neq('user_id', uid);

        const otherIds = [...new Set((others ?? []).map((o) => o.user_id))];
        const nameById: Record<string, string> = {};
        if (otherIds.length > 0) {
          const { data: profs } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', otherIds);
          (profs ?? []).forEach((p) => {
            nameById[p.id] = p.full_name ?? 'Mentorship chat';
          });
        }

        const nextThreads: Thread[] = ids.map((id) => {
          const other = (others ?? []).find((o) => o.conversation_id === id);
          return {
            id,
            otherName: other ? nameById[other.user_id] ?? 'Mentorship chat' : 'Mentorship chat',
          };
        });
        setThreads(nextThreads);

        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', ids)
          .eq('is_read', false)
          .neq('sender_id', uid);
        setUnread(count ?? 0);
      } catch {
        // Messaging not available yet (e.g. RLS not applied) — degrade quietly.
        setThreads([]);
        setUnread(0);
      }
    },
    [supabase]
  );

  const loadMessages = useCallback(
    async (uid: string, conversationId: string) => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('id, conversation_id, sender_id, message, is_read, created_at')
          .eq('conversation_id', conversationId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });
        if (error) throw error;
        setMessages((data as Message[]) ?? []);

        await supabase
          .from('messages')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', uid)
          .eq('is_read', false);
        loadThreads(uid);
      } catch {
        setMessages([]);
      }
    },
    [supabase, loadThreads]
  );

  // --- init: user + realtime ---
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      setUserId(user.id);
      try {
        const res = await fetch('/api/me/access');
        if (res.ok) {
          const a = await res.json();
          if (active) setBlocked(a.hasAccess === false);
        }
      } catch {
        /* leave unblocked on transient error; the send API still enforces 403 */
      }
      await loadThreads(user.id);

      channel = supabase
        .channel(`chatdock-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          () => {
            loadThreads(user.id);
            setSelected((cur) => {
              if (cur) loadMessages(user.id, cur);
              return cur;
            });
          }
        );
      channel.subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, loadThreads, loadMessages]);

  useEffect(() => {
    if (selected && userId) loadMessages(userId, selected);
  }, [selected, userId, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function handleSend() {
    const body = text.trim();
    if (!body || !selected || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selected, message: body }),
      });
      if (res.ok) {
        const msg = (await res.json()) as Message;
        setMessages((prev) => [...prev, msg]);
        setText('');
      }
    } finally {
      setSending(false);
    }
  }

  // Hide for signed-out users and on the full Messages page.
  if (!userId) return null;
  if (pathname?.startsWith('/dashboard/messages')) return null;

  const activeThread = threads.find((t) => t.id === selected);

  if (!open) {
    return (
      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen(true)}
        aria-label={`Open chat${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <ChatBubbleOutlineIcon />
        {blocked ? (
          <span className={styles.launcherBadge}>🔒</span>
        ) : unread > 0 ? (
          <span className={styles.launcherBadge}>{unread > 9 ? '9+' : unread}</span>
        ) : null}
      </button>
    );
  }

  return (
    <div className={styles.dock}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          {activeThread ? activeThread.otherName : 'Messages'}
        </span>
        <div className={styles.headerActions}>
          {activeThread && (
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setSelected(null)}
              aria-label="Back to conversations"
            >
              ‹ All
            </button>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      {blocked ? (
        <div className={styles.empty}>
          <p>Upgrade to a paid plan to message your mentor.</p>
          <a href="/dashboard/mentee/subscription" className={styles.threadName}>
            Choose a plan →
          </a>
        </div>
      ) : !activeThread ? (
        <div className={styles.threadList}>
          {threads.length === 0 ? (
            <div className={styles.empty}>No conversations yet.</div>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.threadItem}
                onClick={() => setSelected(t.id)}
              >
                <span className={styles.threadAvatar}>💬</span>
                <span className={styles.threadName}>{t.otherName}</span>
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          <div className={styles.messages} ref={scrollRef}>
            {messages.length === 0 ? (
              <div className={styles.empty}>Say hello 👋</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.bubble} ${
                    m.sender_id === userId ? styles.bubbleOwn : styles.bubbleOther
                  }`}
                >
                  {m.message}
                </div>
              ))
            )}
          </div>
          <div className={styles.composer}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Write a message…"
              disabled={sending}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !text.trim()}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
