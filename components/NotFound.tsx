import site from '@/content/site';
import styles from './NotFound.module.css';

/**
 * What a visitor sees at a URL that does not exist.
 *
 * Deliberately just the statement and the way back — no explanation of what
 * might have gone wrong. Someone who mistyped a URL does not need the reason
 * narrated to them, and the design system asks for restraint over helpfulness.
 *
 * This renders the body only. The 404 STATUS comes from Next.js serving
 * `app/not-found.tsx`, and it stays a 404 on purpose — redirecting to the home
 * page instead would be a soft 404: the visitor is moved without being told
 * the link was wrong, and a dead URL gets reported to crawlers as a live one.
 */
export default function NotFound() {
  const { notFound } = site;

  return (
    <main className={styles.wrap}>
      <p className={styles.eyebrow}>{notFound.eyebrow}</p>
      <h1 className={styles.heading}>{notFound.heading}</h1>
      <a className={styles.link} href={notFound.linkHref}>
        {notFound.linkLabel}
      </a>
    </main>
  );
}
