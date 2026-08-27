'use client';

import useActiveSection from '@/hooks/useActiveSection';
import useScrolledPast from '@/hooks/useScrolledPast';
import styles from './Nav.module.css';

const SECTIONS = [
  { id: 'work', n: '01', label: 'Work' },
  { id: 'about', n: '02', label: 'About' },
  { id: 'writing', n: '03', label: 'Writing' },
  { id: 'adventures', n: '04', label: 'Adventures' },
  { id: 'elsewhere', n: '05', label: 'Elsewhere' },
];

const CONTACT_ID = 'contact';
const SECTION_IDS = [...SECTIONS.map((s) => s.id), CONTACT_ID];

/**
 * The header, and the indicator that shows which section you are in.
 *
 * The CTA is an action, not a peer. It does not join the indicator; it fills
 * in to acknowledge that the thing you would click is already on screen.
 */
export default function Nav() {
  const active = useActiveSection(SECTION_IDS);
  const solid = useScrolledPast(0.12);

  return (
    <header className={[styles.nav, solid ? styles.solid : ''].join(' ')}>
      <div className={styles.wrap}>
        <NavMark />
        <NavLinks active={active} />
        <a
          className={styles.cta}
          href={`#${CONTACT_ID}`}
          data-here={active === CONTACT_ID ? 'true' : undefined}
        >
          Get in touch
        </a>
      </div>
    </header>
  );
}

export function NavMark() {
  return (
    <a className={styles.mark} href="#top">
      Nadia <em>Eldeib</em>
    </a>
  );
}

/**
 * The section links.
 *
 * The number sits to the LEFT of the label, mirroring the section heads
 * (01 · WORK). It is absolutely positioned into the gap that already exists
 * between nav items, so nothing reflows when it appears and no empty space is
 * reserved when nothing is active — which also sidesteps the shrunk bar, where
 * stacking a number above the label would be tight.
 */
export function NavLinks({ active }: { active: string | null }) {
  return (
    <nav className={styles.links} aria-label="Sections">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          data-n={s.n}
          className={styles.link}
          data-active={active === s.id ? 'true' : undefined}
          aria-current={active === s.id ? 'true' : undefined}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
