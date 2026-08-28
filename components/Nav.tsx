'use client';

import useActiveSection from '@/hooks/useActiveSection';
import useScrolledPast from '@/hooks/useScrolledPast';
import NavMark from './nav/NavMark';
import NavLinks from './nav/NavLinks';
import { CONTACT_ID, SECTION_IDS } from './nav/sections';
import styles from './Nav.module.css';

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
