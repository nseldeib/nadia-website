import styles from '../Work.module.css';

/**
 * The advisory offer.
 *
 * The offer used to hide its specifics behind a `details` toggle; the bullets
 * were cut, so the body now carries the whole thing and the card reads in one
 * pass.
 */
export default function AdvisoryCard({
  label,
  body,
  cta,
}: {
  label: string;
  body: string;
  cta: string;
}) {
  return (
    <div className={styles.advisory}>
      <p className={styles.advisoryLabel}>{label}</p>
      <p className={styles.advisoryBody}>{body}</p>
      <a className={styles.advisoryCta} href="#contact">{cta}</a>
    </div>
  );
}
