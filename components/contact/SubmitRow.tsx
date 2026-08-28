import styles from '../Contact.module.css';

/**
 * The form's closing row: the send button, on its own.
 *
 * The city and timezone were tried here, on the theory that "when will she see
 * this" is asked at the moment of sending. In the layout they read as clutter
 * beside the button and crowded it, so they live in the footer instead, where
 * a location line is a conventional and quiet thing to find.
 *
 * Every "Get in touch" link on the page scrolls to this form, so this row is
 * the one the contact section is sized around: it has to clear the fold rather
 * than sit below it.
 */
export default function SubmitRow({
  label,
  sending,
}: {
  label: string;
  sending: boolean;
}) {
  return (
    <div className={styles.foot}>
      <button className={styles.submit} type="submit" disabled={sending}>
        {sending ? 'Sending…' : label}
      </button>
    </div>
  );
}
