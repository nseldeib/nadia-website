import site from '@/content/site';
import { splitOnBrand } from '@/app/lib/text';
import styles from './Footer.module.css';

export default function Footer() {
  const { footer, contact } = site;

  return (
    <>
      {/* Where she is, ABOVE the footer's rule rather than inside the footer
          band. Sharing the nav's row put it between two unrelated things and
          made it read as an orphan; sitting below the rule made it a second
          footer line. Above the rule it closes the page content instead, in
          the footer's mono voice so it still reads as quiet chrome. */}
      <div className={styles.placeRow}>
        <FooterPlace place={contact.findMe.place} />
      </div>
      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <nav className={styles.nav} aria-label="Footer">
            {footer.nav.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>
          <FooterSignoff text={footer.signoff} href={footer.signoffHref} />
        </div>
      </footer>
    </>
  );
}

/** The city and timezone, joined by a middot so they read as one line. */
export function FooterPlace({ place }: { place: string[] }) {
  const parts = place.filter(Boolean);
  if (parts.length === 0) return null;

  return <span className={styles.place}>{parts.join(' · ')}</span>;
}

/**
 * The signoff, with the brand linked in place.
 *
 * The copy is authored as one sentence rather than assembled from fragments,
 * so the link is found inside it instead of the sentence being built around
 * the link. If the brand is edited out, the sentence still renders whole.
 */
export function FooterSignoff({ text, href }: { text: string; href?: string | null }) {
  const BRAND = 'CodeYam';
  const { before, after, found } = splitOnBrand(text, BRAND);

  return (
    <span className={styles.signoff}>
      {before}
      {found &&
        (href ? (
          <a href={href} target="_blank" rel="noopener noreferrer">{BRAND}</a>
        ) : (
          BRAND
        ))}
      {after}
    </span>
  );
}
