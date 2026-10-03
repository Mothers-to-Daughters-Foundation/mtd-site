'use client';

import { useEffect, useRef, useState } from 'react';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { createClient } from '@/lib/supabase/client';
import { appHref } from '@/lib/appUrl';
import styles from './NotificationBell.module.css';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
};

function hrefForType(type: string): string {
  if (type === 'new_message') return appHref('/dashboard/messages');
  if (type === 'resource') return appHref('/dashboard');
  if (type === 'subscription') return appHref('/dashboard/mentee/subscription');
  return appHref('/dashboard');
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.is_read).length;

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      setUserId(user.id);

      const load = async () => {
        const { data } = await supabase
          .from('notifications')
          .select('id, type, title, message, related_id, is_read, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (active) setItems((data as Notification[]) ?? []);
      };

      await load();

      channel = supabase
        .channel(`header-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          load
        );
      channel.subscribe();
    }

    init();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Close popover on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    // Mark all read when the popover is opened.
    if (next && unread > 0 && userId) {
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);
    }
  }

  if (!userId) return null;

  return (
    <div className={styles.wrapper} ref={wrapRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={toggle}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
      >
        <NotificationsNoneIcon className={styles.bellIcon} />
        {unread > 0 && (
          <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className={styles.popover} role="menu">
          <div className={styles.popoverHeader}>Notifications</div>
          {items.length === 0 ? (
            <div className={styles.empty}>You&apos;re all caught up.</div>
          ) : (
            <ul className={styles.list}>
              {items.map((n) => (
                <li key={n.id} className={styles.item}>
                  <a href={hrefForType(n.type)} className={styles.itemLink}>
                    <div className={styles.itemTitle}>{n.title}</div>
                    <div className={styles.itemMessage}>{n.message}</div>
                    <div className={styles.itemTime}>{timeAgo(n.created_at)}</div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
