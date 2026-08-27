import styles from '../Hero.module.css';

/**
 * The headline that types itself in.
 *
 * Pure CSS: a `clip-path` reveal on a `steps()` function, with the cursor
 * riding the same function so it sits on the text edge rather than drifting
 * ahead of it. The step count is the line's own character count, so it is
 * derived from the words and cannot fall out of sync with them.
 */
export default function TypedHeadline({ lines }: { lines: string[] }) {
  return (
    <h1 className={styles.headline}>
      {lines.map((line, i) => (
        <span
          key={line}
          className={styles.line}
          style={{ ['--chars' as string]: line.length }}
          data-line={i + 1}
        >
          <span className={styles.text}>{line}</span>
          <span className={styles.cursor} aria-hidden="true" />
        </span>
      ))}
    </h1>
  );
}
