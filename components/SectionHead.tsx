import styles from './SectionHead.module.css';

/**
 * The numbered eyebrow every section carries: `01 · WORK`.
 *
 * The number is real information, not decoration — the sections are a
 * sequence, and the nav indicator mirrors this exact pairing.
 */
export default function SectionHead({ n, eyebrow }: { n: string; eyebrow: string }) {
  return (
    <div className={styles.head}>
      <span className={styles.n}>{n}</span>
      <span className={styles.eyebrow}>{eyebrow}</span>
    </div>
  );
}
