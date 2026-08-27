import styles from '../Work.module.css';

/** External links, each showing its destination so the target is never a surprise. */
export default function WorkLinkList({
  links,
}: {
  links: { href: string; label: string; host?: string }[];
}) {
  return (
    <ul className={styles.links}>
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} target="_blank" rel="noopener noreferrer">
            <span>{l.label}</span>
            <span className={styles.host}>{l.host}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
