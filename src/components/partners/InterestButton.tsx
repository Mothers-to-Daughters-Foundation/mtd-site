'use client';

import styles from './PartnerTiers.module.css';

export const PARTNER_FORM_ID = 'partner-form';
export const TIER_SELECT_EVENT = 'partner-tier:select';

/**
 * Scrolls to the partnership form and, when `tier` is given, ticks that tier
 * there (the form listens for TIER_SELECT_EVENT).
 */
export default function InterestButton({ label, tier }: { label: string; tier?: string }) {
  const onClick = () => {
    if (tier) window.dispatchEvent(new CustomEvent(TIER_SELECT_EVENT, { detail: tier }));
    const form = document.getElementById(PARTNER_FORM_ID);
    form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  };
  return (
    <button type="button" className={styles.cta} onClick={onClick}>
      {label} <span aria-hidden="true">→</span>
    </button>
  );
}
