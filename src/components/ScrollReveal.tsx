'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Fades each block of the public pages in as it scrolls into view, slightly
 * staggered. Content is only hidden once this script runs (html.reveal-ready),
 * so nothing disappears without JavaScript, and it does nothing for people who
 * turn off motion. The first section of each page is left alone.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const sections = [...document.querySelectorAll('main > section')].slice(1);
    const targets: HTMLElement[] = [];
    for (const section of sections) {
      const blocks = section.querySelectorAll<HTMLElement>(':scope > div > *');
      blocks.forEach((el, i) => {
        if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen
        el.dataset.reveal = '';
        el.style.setProperty('--reveal-delay', `${Math.min(i, 4) * 70}ms`);
        targets.push(el);
      });
    }
    document.documentElement.classList.add('reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = 'in';
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      targets.forEach((el) => {
        el.dataset.reveal = 'in';
      });
    };
  }, [pathname]);

  return null;
}
