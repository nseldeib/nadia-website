import styles from '../Contact.module.css';

/**
 * The form's closing row: the send button, and where she is when it arrives.
 *
 * The city and timezone sit HERE rather than at the foot of the section
 * because they answer a question the reader has at this exact moment — when
 * will she see this — and that question is asked while deciding to send, not
 * several hundred pixels later after the profiles have been read past.
 *
 * Every "Get in touch" link on the page scrolls to this form, so this row is
 * also the one the contact section is sized around: it has to clear the fold
 * rather than sit below it.
 */
export default function SubmitRow({
  label,
  place,
  sending,
}: {
  label: string;
  place: string[];
  sending: boolean;
}) {
  const [city, zone] = place;

  return (
    <div className={styles.foot}>
      <button className={styles.submit} type="submit" disabled={sending}>
        {sending ? 'Sending…' : label}
      </button>
      <p className={styles.footPlace}>
        {city ? <span className={styles.now}>{city}</span> : null}
        {zone ? <span className={styles.tz}>{zone}</span> : null}
      </p>
    </div>
  );
}
