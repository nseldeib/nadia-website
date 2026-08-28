import styles from '../Contact.module.css';
import SocialIcon from './SocialIcon';

/**
 * One profile: its brand mark and name on the left, the handle right-aligned.
 *
 * The whole row is the link, so the hover colour is set on the anchor and the
 * icon and handle follow it rather than holding their own resting colour.
 */
export default function SocialRow({
  social,
}: {
  social: { href: string; name: string; handle: string };
}) {
  return (
    <li>
      <a href={social.href} target="_blank" rel="noopener noreferrer">
        <span className={styles.socialLeft}>
          <SocialIcon name={social.name} className={styles.socialIcon} />
          <span className={styles.socialName}>{social.name}</span>
        </span>
        <span className={styles.socialHandle}>{social.handle}</span>
      </a>
    </li>
  );
}
