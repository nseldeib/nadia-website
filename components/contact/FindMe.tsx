import styles from '../Contact.module.css';
import SocialList from './SocialList';

/**
 * Where else to find her, and where she is.
 *
 * It shares the section with the form rather than standing alone: both answer
 * the same reader question, so they should not compete as two destinations.
 */
export default function FindMe({
  heading,
  socials,
  place,
}: {
  heading: string;
  socials: { href: string; name: string; handle: string }[];
  place: string[];
}) {
  return (
    <div className={styles.findMe}>
      <h3 className={styles.findMeHeading}>{heading}</h3>
      <SocialList socials={socials} />
      <p className={styles.place}>
        {place.map((p, i) => (
          <span key={p} className={i === 0 ? styles.now : styles.tz}>{p}</span>
        ))}
      </p>
    </div>
  );
}
