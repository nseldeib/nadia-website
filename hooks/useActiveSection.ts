'use client';

import { useEffect, useState } from 'react';
import { pickActive } from '@/app/lib/activeSection';

/**
 * Which section the reader is currently in.
 *
 * A thin band ~40% down the viewport. Sections are contiguous, so at most one
 * crosses it, and none do while the hero fills the screen — which is why the
 * indicator is absent at the top rather than guessing.
 *
 * IntersectionObserver rather than a CSS scroll timeline: the timeline version
 * flipped between its fill states when a section did not fully cover the
 * viewport, which read as the number blinking. The choice of which visible
 * section wins lives in `pickActive`, so it can be exercised without a DOM.
 */
export default function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(',');

  useEffect(() => {
    const order = key.split(',');
    const nodes: HTMLElement[] = [];
    for (const id of order) {
      const el = document.getElementById(id);
      if (el) nodes.push(el);
    }
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive(pickActive(order, visible));
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [key]);

  return active;
}
