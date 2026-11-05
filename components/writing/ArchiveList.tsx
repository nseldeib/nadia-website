import type { PostSummary } from '@/app/lib/posts';
import { formatPostDate, groupPostsByYear } from '@/app/lib/postDates';
import styles from './ArchiveList.module.css';

/**
 * Everything written, newest first, cut into years.
 *
 * The year is a marker in the left column rather than a heading above each
 * run: the archive is one continuous list and a run of headings would break it
 * into what look like separate sections. Twenty posts over two years should
 * read as one body of work.
 */
export default function ArchiveList({ posts }: { posts: PostSummary[] }) {
  const groups = groupPostsByYear(posts);

  return (
    <div className={styles.archive}>
      {groups.map((group) => (
        <section key={group.year} className={styles.year} aria-label={String(group.year)}>
          <h2 className={styles.yearMark}>{group.year}</h2>
          <ul className={styles.posts}>
            {group.posts.map((post) => (
              <li key={post.slug}>
                <a className={styles.row} href={`/writing/${post.slug}`}>
                  <span className={styles.date}>{formatPostDate(post.publishedAt)}</span>
                  <span className={styles.text}>
                    <span className={styles.title}>{post.title}</span>
                    {post.subtitle && <span className={styles.subtitle}>{post.subtitle}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
