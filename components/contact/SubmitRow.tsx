import styles from '../Contact.module.css';

/**
 * The form's closing row: the send button and the note about when she replies.
 *
 * Every "Get in touch" link on the page scrolls here, so this row is the one
 * the contact section is sized around — it has to clear the fold rather than
 * sit below it.
 */
export default function SubmitRow({
  label,
  reply,
  sending,
}: {
  label: string;
  reply: string | null;
  sending: boolean;
}) {
  return (
    <div className={styles.foot}>
      <button className={styles.submit} type="submit" disabled={sending}>
        {sending ? 'Sending…' : label}
      </button>
      <span className={styles.reply}>{reply}</span>
    </div>
  );
}
