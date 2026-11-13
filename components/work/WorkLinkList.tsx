import styles from '../Work.module.css';

/**
 * A ruled list of links, each showing its destination so the target is never a
 * surprise. External by default (new tab); pass `external={false}` for links
 * that stay on this site, which open in the same tab like every other
 * internal link.
 */
export default function WorkLinkList({
  links,
  external = true,
  className,
}: {
  links: { href: string; label: string; host?: string }[];
  external?: boolean;
  className?: string;
}) {
  const newTab = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <ul className={className ? `${styles.links} ${className}` : styles.links}>
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} {...newTab}>
            <span>{l.label}</span>
            {l.host && <span className={styles.host}>{l.host}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
