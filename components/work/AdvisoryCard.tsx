import styles from '../Work.module.css';

/**
 * The advisory offer.
 *
 * The specifics sit inside a `details` rather than on the surface: someone
 * scanning needs the offer, and someone who wants the scope will open it.
 */
export default function AdvisoryCard({
  label,
  body,
  summary,
  bullets,
  cta,
}: {
  label: string;
  body: string;
  summary: string;
  bullets: string[];
  cta: string;
}) {
  return (
    <div className={styles.advisory}>
      <p className={styles.advisoryLabel}>{label}</p>
      <p className={styles.advisoryBody}>{body}</p>
      <details className={styles.details}>
        <summary>{summary}</summary>
        <ul>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </details>
      <a className={styles.advisoryCta} href="#contact">{cta}</a>
    </div>
  );
}
