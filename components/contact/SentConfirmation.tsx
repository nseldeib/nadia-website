import styles from '../Contact.module.css';

/** Replaces the form once a note lands, which also makes a duplicate send impossible. */
export default function SentConfirmation({ reply }: { reply: string }) {
  return (
    <div className={styles.confirm} role="status">
      <h3>Thanks, that came through.</h3>
      <p>{reply}</p>
    </div>
  );
}
