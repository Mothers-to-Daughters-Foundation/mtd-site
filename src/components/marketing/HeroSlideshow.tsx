'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getImagePath } from '@/lib/utils';
import styles from './HeroSlideshow.module.css';

const SLIDES = [1, 2, 3, 4, 5].map((n) => `/images/home/hero-slide-${n}.jpg`);
const INTERVAL_MS = 5000;

/**
 * The home hero's photo slideshow (the live site's five images), crossfading.
 * Pauses while hovered or focused and when the tab is hidden; stays on the first
 * photo for people who turn off motion.
 */
export default function HeroSlideshow({ alt }: { alt: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div
      className={styles.slideshow}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Photos from Mothers to Daughters"
    >
      {SLIDES.map((src, i) => (
        <Image
          key={src}
          src={getImagePath(src)}
          alt={i === index ? alt : ''}
          aria-hidden={i !== index}
          width={1224}
          height={724}
          priority={i === 0}
          className={`${styles.slide} ${i === index ? styles.active : ''}`}
        />
      ))}
      <div className={styles.dots}>
        {SLIDES.map((src, i) => (
          <button
            key={src}
            type="button"
            className={`${styles.dot} ${i === index ? styles.dotOn : ''}`}
            aria-label={`Show photo ${i + 1} of ${SLIDES.length}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
