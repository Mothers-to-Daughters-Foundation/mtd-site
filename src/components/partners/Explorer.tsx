'use client';

import { Fragment, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import styles from './Explorer.module.css';

export type ExplorerItem = {
  id: string;
  label: string;
  /** Short text on the right of the label, e.g. an amount. */
  meta?: string;
  content: ReactNode;
};

/**
 * A list of items with one open at a time. Desktop: the list on the left, the
 * open item's details on the right. Phones: an accordion, details under the item.
 * `numbered` shows 01, 02…; `ladder` shows a bar that shortens down the list.
 */
export default function Explorer({
  items,
  variant = 'numbered',
  label,
}: {
  items: ExplorerItem[];
  variant?: 'numbered' | 'ladder';
  label: string;
}) {
  const [active, setActive] = useState(0);
  const base = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = items.length - 1;
    const next =
      e.key === 'ArrowDown' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowUp' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <div
      className={`${styles.explorer} ${variant === 'ladder' ? styles.ladder : ''}`}
      role="group"
      aria-label={label}
      style={{ '--rows': items.length } as CSSProperties}
    >
      {items.map((item, i) => {
        const open = i === active;
        const buttonId = `${base}-b${i}`;
        const panelId = `${base}-p${i}`;
        return (
          <Fragment key={item.id}>
            <button
              ref={(el) => {
                buttons.current[i] = el;
              }}
              id={buttonId}
              type="button"
              className={`${styles.item} ${open ? styles.itemOpen : ''}`}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {variant === 'numbered' && (
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}
              <span className={styles.text}>
                <span className={styles.label}>{item.label}</span>
                {variant === 'ladder' && (
                  <span
                    className={styles.rung}
                    style={{ width: `${100 - (i / Math.max(1, items.length - 1)) * 65}%` }}
                    aria-hidden="true"
                  />
                )}
              </span>
              {item.meta && <span className={styles.meta}>{item.meta}</span>}
              <span className={styles.chevron} aria-hidden="true">
                ›
              </span>
            </button>
            {open && (
              <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.panel}>
                {item.content}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
