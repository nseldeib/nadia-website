import styles from '../Writing.module.css';
import ExternalLinkIcon from './ExternalLinkIcon';

/** What she writes about, and the way through to everything else. */
export default function WritingIntro({
  lede,
  cta,
}: {
  lede: string;
  cta: { href: string; label: string };
}) {
  return (
    <div>
      <p className={styles.lede}>{lede}</p>
      <a className={styles.cta} href={cta.href} target="_blank" rel="noopener noreferrer">
        {cta.label}
        <ExternalLinkIcon />
      </a>
    </div>
  );
}
