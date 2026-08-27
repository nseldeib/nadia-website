'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * True once the page has scrolled past `fraction` of the viewport height.
 *
 * Reads are batched into a frame so a fast scroll does not thrash layout, and
 * the initial call settles the state for a page restored mid-scroll.
 */
export default function useScrolledPast(fraction: number): boolean {
  const [past, setPast] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setPast(window.scrollY > window.innerHeight * fraction);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [fraction]);

  return past;
}
