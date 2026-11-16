import Link from 'next/link';
import styles from './TierCard.module.css';
import { appHref } from '@/lib/appUrl';
import TierArt, { type TierTheme } from './TierArt';
import themes from './TierArt.module.css';

interface TierCardProps {
  id: string;
  name: string;
  description: string;
  pricePerMonth: number;
  features: string[];
  zeffyUrl?: string;
  isDefault?: boolean;
  theme?: TierTheme;
}

export default function TierCard({
  id,
  name,
  description,
  pricePerMonth,
  features,
  zeffyUrl,
  isDefault,
  theme = 'flight',
}: TierCardProps) {
  return (
    <div className={`${styles.card} ${themes[theme]} ${isDefault ? styles.cardFeatured : ''}`}>
      {isDefault && <div className={styles.featuredBadge}>Most Popular</div>}
      <TierArt theme={theme} className={themes.art} />
      <div className={styles.name}>{name}</div>
      <div className={styles.price}>
        ${(pricePerMonth / 100).toFixed(2)}
        <span className={styles.period}>/mo</span>
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {features.length > 0 && (
        <ul className={styles.features}>
          {features.map((f, i) => (
            <li key={i}>
              <span className={styles.check}>✓</span>
              {f}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.cta}>
        {zeffyUrl ? (
          <a
            href={zeffyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btn}
          >
            Donate via Zeffy
          </a>
        ) : (
          <Link
            href={appHref(`/register?tier=${id}`)}
            className={`${styles.btn} ${isDefault ? styles.btnFeatured : ''}`}
          >
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
}
