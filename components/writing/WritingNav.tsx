import styles from './WritingNav.module.css';

/**
 * The header the writing pages use instead of the homepage nav.
 *
 * `Nav` cannot be reused here: every one of its links is a hash into a section
 * of `/`, and it drives an active-section observer over ids that do not exist
 * on this route. Pointing those at `/#work` would give the reader a nav whose
 * indicator never lights and whose every item leaves the page.
 *
 * So this is the small honest version — the wordmark home, and the archive —
 * carrying the same mark styling so it still reads as the same site.
 */
export default function WritingNav({ current }: { current: 'archive' | 'post' }) {
  return (
    <header className={styles.nav}>
      <div className={styles.wrap}>
        <a className={styles.mark} href="/">
          Nadia <em>Eldeib</em>
        </a>
        <nav className={styles.links} aria-label="Writing">
          <a href="/writing" aria-current={current === 'archive' ? 'page' : undefined}>
            Writing
          </a>
          <a className={styles.cta} href="/#contact">
            Get in touch
          </a>
        </nav>
      </div>
    </header>
  );
}
