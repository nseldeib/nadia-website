import styles from '../Writing.module.css';
import ExternalLinkIcon from './ExternalLinkIcon';

/**
 * The way through to everything else. It follows the post list because that is
 * the order the reader wants it in: the three posts are the sample, and the
 * invitation to subscribe only lands once they have been read past.
 */
export default function WritingCta({ cta }: { cta: { href: string; label: string } }) {
  return (
    <div className={styles.ctaRow}>
      <a className={styles.cta} href={cta.href} target="_blank" rel="noopener noreferrer">
        {cta.label}
        <ExternalLinkIcon />
      </a>
    </div>
  );
}
