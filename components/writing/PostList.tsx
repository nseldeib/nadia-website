import type { PostSummary } from '@/app/lib/posts';
import { formatPostDate } from '@/app/lib/postDates';
import styles from '../Writing.module.css';

/**
 * A few recent essays, dated so the list reads as a timeline.
 *
 * These used to be three hardcoded entries in `content/site.json`, each opening
 * Substack in a new tab. They are now rows from the store and they open pages
 * on this site — which is why the `target="_blank"` is gone: a link to your own
 * site that spawns a tab is a link that does not know where it goes.
 */
export default function PostList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <ul className={styles.posts}>
      {posts.map((p) => (
        <li key={p.slug}>
          <a href={`/writing/${p.slug}`}>
            <span className={styles.date}>{formatPostDate(p.publishedAt)}</span>
            <span className={styles.title}>{p.title}</span>
            <span className={styles.arrow} aria-hidden="true">&rarr;</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
