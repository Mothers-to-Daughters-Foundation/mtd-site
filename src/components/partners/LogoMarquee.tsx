import Image from 'next/image';
import { PARTNER_LOGOS } from '@/lib/partners';
import { getImagePath } from '@/lib/utils';
import styles from './LogoMarquee.module.css';

/**
 * Partner logos scrolling continuously from right to left. The list is drawn
 * twice so the loop is seamless; the copy is hidden from screen readers.
 * Pauses on hover or keyboard focus, and becomes a static, wrapping row for
 * people who turn off motion.
 */
export default function LogoMarquee({ logos = PARTNER_LOGOS }: { logos?: typeof PARTNER_LOGOS }) {
  const row = (copy: boolean) => (
    <ul className={styles.row} aria-hidden={copy || undefined}>
      {logos.map((logo) => (
        <li key={logo.alt} className={styles.logo}>
          <Image
            src={getImagePath(logo.src)}
            alt={copy ? '' : logo.alt}
            width={200}
            height={100}
            className={styles.image}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.marquee} role="region" aria-label="Partner logos" tabIndex={0}>
      <div className={styles.track}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
