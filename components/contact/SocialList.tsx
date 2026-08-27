import styles from '../Contact.module.css';

/** The profiles, ordered the way she actually uses them. */
export default function SocialList({
  socials,
}: {
  socials: { href: string; name: string; handle: string }[];
}) {
  return (
    <ul className={styles.socials}>
      {socials.map((s) => (
        <li key={s.href}>
          <a href={s.href} target="_blank" rel="noopener noreferrer">
            <span className={styles.socialName}>{s.name}</span>
            <span className={styles.socialHandle}>{s.handle}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
