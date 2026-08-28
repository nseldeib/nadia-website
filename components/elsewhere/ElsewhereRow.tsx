import styles from '../Elsewhere.module.css';

/**
 * One entry: what kind of thing it is, what it is, where, and when.
 *
 * Entries that have a second home (a film also listed on IMDb) used to hang a
 * small extra link off the row. It floated free of the four aligned columns
 * and read as stray fine print, so the row now carries a single destination
 * and the second URL is left in the content for reference.
 */
export default function ElsewhereRow({
  row,
}: {
  row: { href: string; kind: string; title: string; venue: string; year: string };
}) {
  return (
    <li>
      <a href={row.href} target="_blank" rel="noopener noreferrer">
        <span className={styles.kind}>{row.kind}</span>
        <span className={styles.title}>{row.title}</span>
        <span className={styles.venue}>{row.venue}</span>
        <span className={styles.year}>{row.year}</span>
      </a>
    </li>
  );
}
