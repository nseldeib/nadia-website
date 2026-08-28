import styles from '../Nav.module.css';

/** The wordmark, and the way back to the top of the page. */
export default function NavMark() {
  return (
    <a className={styles.mark} href="#top">
      Nadia <em>Eldeib</em>
    </a>
  );
}
