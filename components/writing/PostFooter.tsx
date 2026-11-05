import type { PostSummary } from '@/app/lib/posts';
import ExternalLinkIcon from './ExternalLinkIcon';
import styles from './PostFooter.module.css';

/**
 * What follows a post: the invitation to subscribe, the posts on either side,
 * and the way back.
 *
 * The brief was all three "without competing CTAs", and the resolution is
 * hierarchy rather than omission. Exactly one thing here is an action — the
 * subscribe link, in display type at lead size. Everything else is navigation:
 * mono, meta-coloured, at label size, separated from the action by a rule.
 * Three buttons in a row would make the reader choose between three equal
 * things; this makes one obvious and keeps the other two available.
 *
 * `previous` is older and `next` is newer, matching the archive's own ordering
 * so "next" always means further along the list the reader came from.
 */
export default function PostFooter({
  cta,
  previous,
  next,
}: {
  cta: { label: string; href: string };
  previous: PostSummary | null;
  next: PostSummary | null;
}) {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div className={styles.subscribe}>
          <p className={styles.invite}>
            I write about building software with AI, and what I am learning along the way.
          </p>
          <a className={styles.cta} href={cta.href} target="_blank" rel="noopener noreferrer">
            {cta.label}
            <ExternalLinkIcon />
          </a>
        </div>

        <nav className={styles.around} aria-label="More writing">
          {previous ? (
            <a className={`${styles.step} ${styles.prev}`} href={`/writing/${previous.slug}`}>
              <span className={styles.dir}>Older</span>
              <span className={styles.stepTitle}>{previous.title}</span>
            </a>
          ) : (
            /* The placeholder keeps `next` in its column on the oldest post,
               instead of letting it slide left where "Newer" reads as "Older". */
            <span aria-hidden="true" />
          )}

          {next && (
            <a className={`${styles.step} ${styles.next}`} href={`/writing/${next.slug}`}>
              <span className={styles.dir}>Newer</span>
              <span className={styles.stepTitle}>{next.title}</span>
            </a>
          )}
        </nav>

        <a className={styles.back} href="/writing">
          All writing
        </a>
      </div>
    </footer>
  );
}
