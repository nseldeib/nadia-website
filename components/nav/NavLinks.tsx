import styles from '../Nav.module.css';
import { SECTIONS } from './sections';

/**
 * The section links.
 *
 * The number sits to the LEFT of the label, mirroring the section heads
 * (01 · WORK). It is absolutely positioned into the gap that already exists
 * between nav items, so nothing reflows when it appears and no empty space is
 * reserved when nothing is active — which also sidesteps the shrunk bar, where
 * stacking a number above the label would be tight.
 *
 * Hover and focus reveal the same number the active state shows, so pointing
 * at a link previews where it goes before you commit to the jump.
 */
export default function NavLinks({ active }: { active: string | null }) {
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
