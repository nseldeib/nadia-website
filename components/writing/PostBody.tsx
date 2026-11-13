import styles from './PostBody.module.css';

/**
 * The essay itself, on the page's light surface.
 *
 * Two decisions worth stating, because both look arbitrary and neither is.
 *
 * The light surface: Night Field is a dark design, and `About` is already the
 * exception that proves why — its own comment says the light band exists
 * because it "carries the most body copy, which is where dark-on-light
 * actually helps someone read". A post runs to twenty thousand characters,
 * several times what About carries, so if that reasoning held there it holds
 * here with more force. The page keeps the site's dark frame and gives the
 * reading itself the light ground.
 *
 * `dangerouslySetInnerHTML`: the HTML is not arbitrary. It has already been
 * reduced to a fixed tag allowlist by `sanitizePostHtml` on the way into the
 * database, so what reaches this component cannot carry a script, a form, or
 * an attribute outside the allowlist. Sanitizing here instead would mean doing
 * it on every render of every post rather than once when a post is first seen.
 */
export default function PostBody({ html }: { html: string }) {
  return (
    <div className={`${styles.body} surface-light`}>
      <div className={styles.measure} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
