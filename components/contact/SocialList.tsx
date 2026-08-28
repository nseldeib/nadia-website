import styles from '../Contact.module.css';
import SocialRow from './SocialRow';

/** The profiles, ordered the way she actually uses them. */
export default function SocialList({
  socials,
}: {
  socials: { href: string; name: string; handle: string }[];
}) {
  return (
    <ul className={styles.socials}>
      {socials.map((s) => (
        <SocialRow key={s.href} social={s} />
      ))}
    </ul>
  );
}
