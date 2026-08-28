import styles from '../Writing.module.css';

/**
 * What she writes about. It sits directly under the heading rather than in a
 * second column beside it — a lede reads as a subheading only when it follows
 * the heading, and set alongside it competed with it instead.
 */
export default function WritingIntro({ lede }: { lede: string }) {
  return <p className={styles.lede}>{lede}</p>;
}
