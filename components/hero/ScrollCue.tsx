import styles from '../Hero.module.css';

/**
 * The cue into the first section.
 *
 * It names where it goes rather than saying "scroll": what is below is more
 * compelling than the instruction to look at it.
 */
export default function ScrollCue({
  href,
  label,
  title,
}: {
  href: string;
  label: string;
  title: string;
}) {
  return (
    <a className={styles.cue} href={href}>
      <span className={styles.cueLabel}>{label}</span>
      <span className={styles.cueTitle}>{title}</span>
      <span className={styles.arrow} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </span>
    </a>
  );
}
