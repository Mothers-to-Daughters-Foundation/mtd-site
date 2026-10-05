'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getImagePath } from '@/lib/utils';
import styles from './ProgramCarousel.module.css';

const slides = [
  {
    src: '/images/programs/program-slide-1.png',
    alt: 'Program goals: entrepreneurial success, industry knowledge, and life mastery',
  },
  {
    src: '/images/programs/program-slide-2.png',
    alt: 'Key topics covered in the M2D mentoring program',
  },
  {
    src: '/images/programs/program-slide-3.png',
    alt: 'Program structure: tailored mentorship, guidance, networking, and community',
  },
];

export default function ProgramCarousel() {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  function show(next: number) {
    setIndex((next + count) % count);
  }

  return (
    <div className={styles.carousel} aria-roledescription="carousel" aria-label="Program highlights">
      <button
        type="button"
        className={`${styles.nav} ${styles.prev}`}
        aria-label="Previous slide"
        onClick={() => show(index - 1)}
      >
        ‹
      </button>

      <div className={styles.viewport}>
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.src}
            className={`${styles.slide} ${slideIndex === index ? styles.slideActive : ''}`}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={getImagePath(slide.src)}
              alt={slide.alt}
              width={1080}
              height={1920}
              className={styles.image}
              priority={slideIndex === 0}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.nav} ${styles.next}`}
        aria-label="Next slide"
        onClick={() => show(index + 1)}
      >
        ›
      </button>

      <div className={styles.dots} role="tablist" aria-label="Slides">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-label={`Slide ${slideIndex + 1}`}
            aria-selected={slideIndex === index}
            className={`${styles.dot} ${slideIndex === index ? styles.dotActive : ''}`}
            onClick={() => show(slideIndex)}
          />
        ))}
      </div>
    </div>
  );
}
