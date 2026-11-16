'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from './ImpactStories.module.css';

const INTERVAL_MS = 9000;

/**
 * One testimonial at a time with arrows and dots, like the live site's Impact
 * Stories slideshow. Advances on its own until someone interacts or hovers;
 * never auto-advances for people who turn off motion.
 */
export default function StoryCarousel({ slides, labels }: { slides: ReactNode[]; labels: string[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (hovered || interacted) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [hovered, interacted, count]);

  const go = (i: number) => {
    setInteracted(true);
    setIndex((i + count) % count);
  };

  return (
    <div
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label="Impact stories"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => go(index - 1)} aria-label="Previous story">
        ‹
      </button>
      <div className={styles.viewport} aria-live={interacted ? 'polite' : 'off'}>
        {slides.map((slide, i) => (
          <div
            key={labels[i]}
            className={`${styles.slide} ${i === index ? styles.slideOn : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${labels[i]}`}
            hidden={i !== index}
          >
            {slide}
          </div>
        ))}
      </div>
      <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => go(index + 1)} aria-label="Next story">
        ›
      </button>
      <div className={styles.dots}>
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`${styles.dot} ${i === index ? styles.dotOn : ''}`}
            aria-label={`Show story from ${label}`}
            aria-current={i === index}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
