import styles from '../Writing.module.css';

/** A few recent essays, dated so the list reads as a timeline. */
export default function PostList({
  posts,
}: {
  posts: { href: string; date: string; title: string }[];
}) {
  return (
    <ul className={styles.posts}>
      {posts.map((p) => (
        <li key={p.href}>
          <a href={p.href} target="_blank" rel="noopener noreferrer">
            <span className={styles.date}>{p.date}</span>
            <span className={styles.title}>{p.title}</span>
            <span className={styles.arrow} aria-hidden="true">&rarr;</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
