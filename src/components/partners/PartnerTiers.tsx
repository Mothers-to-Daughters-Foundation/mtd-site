'use client';

import { useState } from 'react';
import Explorer from './Explorer';
import InterestButton from './InterestButton';
import styles from './PartnerTiers.module.css';

export interface Tier {
  name: string;
  amount?: string;
  audience?: string;
  benefits: string[];
}

/** Financial and in-kind tiers as a ladder, with a toggle between the two. */
export default function PartnerTiers({ financial, inKind }: { financial: Tier[]; inKind: Tier[] }) {
  const [kind, setKind] = useState<'financial' | 'inKind'>('financial');
  const tiers = kind === 'financial' ? financial : inKind;

  return (
    <div className={styles.wrap}>
      <div className={styles.toggle} role="group" aria-label="Type of support">
        <button
          type="button"
          aria-pressed={kind === 'financial'}
          className={kind === 'financial' ? styles.toggleOn : ''}
          onClick={() => setKind('financial')}
        >
          Financial support
        </button>
        <button
          type="button"
          aria-pressed={kind === 'inKind'}
          className={kind === 'inKind' ? styles.toggleOn : ''}
          onClick={() => setKind('inKind')}
        >
          In-kind support
        </button>
      </div>

      <p className={styles.hint}>
        {kind === 'financial'
          ? 'Seven levels of sponsorship, from $1,000. Select a tier to see what it includes.'
          : 'Contribute services, expertise or resources instead of funds. Select one to see how.'}
      </p>

      <Explorer
        key={kind}
        variant="ladder"
        label={kind === 'financial' ? 'Financial partnership tiers' : 'In-kind partnership options'}
        items={tiers.map((tier) => {
          const option = tier.amount ? `${tier.name} (${tier.amount})` : undefined;
          return {
            id: tier.name,
            label: tier.name.replace(/\s*\(Non-Monetary\)/, ''),
            meta: tier.amount,
            content: (
              <div className={styles.detail}>
                <h3 className={styles.detailTitle}>{tier.name.replace(/\s*\(Non-Monetary\)/, '')}</h3>
                {tier.amount && <p className={styles.amount}>{tier.amount}</p>}
                {tier.audience && <p className={styles.audience}>{tier.audience.replace(/:$/, '')}</p>}
                <ul className={styles.benefits}>
                  {tier.benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <InterestButton
                  label={option ? 'This tier interests me' : 'Tell us what you can offer'}
                  tier={option}
                />
              </div>
            ),
          };
        })}
      />
    </div>
  );
}
