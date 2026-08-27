import styles from '../Elsewhere.module.css';

/**
 * One entry: what kind of thing it is, what it is, where, and when.
 *
 * A few entries have a second home (a film also listed on IMDb), which hangs
 * off the row rather than duplicating it.
 */
export default function ElsewhereRow({
  row,
}: {
  row: { href: string; kind: string; title: string; venue: string; year: string; secondHref?: string | null };
}) {
  return (
    <li>
      <a href={row.href} target="_blank" rel="noopener noreferrer">
        <span className={styles.kind}>{row.kind}</span>
        <span className={styles.title}>{row.title}</span>
        <span className={styles.venue}>{row.venue}</span>
        <span className={styles.year}>{row.year}</span>
      </a>
      {row.secondHref ? (
        <a className={styles.also} href={row.secondHref} target="_blank" rel="noopener noreferrer">
          IMDb
        </a>
      ) : null}
    </li>
  );
}
