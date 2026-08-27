import styles from '../Contact.module.css';

/**
 * Shown when a note did not send.
 *
 * It says nothing was lost, because nothing was, and it offers the profiles as
 * another route — there is deliberately no email address anywhere on this site
 * to fall back to.
 */
export default function FormFailure({
  message,
  socials,
}: {
  message: string;
  socials: { name: string; href: string }[];
}) {
  const offered = socials.slice(0, 3);

  return (
    <p className={styles.failure} role="alert">
      {message} Nothing you wrote was lost. Try again, or come find me on{' '}
      {offered.map((s, i, arr) => (
        <span key={s.href}>
          {i > 0 ? (i === arr.length - 1 ? ', or ' : ', ') : ''}
          <a href={s.href} target="_blank" rel="noopener noreferrer">{s.name}</a>
          {i === arr.length - 1 ? '.' : ''}
        </span>
      ))}
    </p>
  );
}
