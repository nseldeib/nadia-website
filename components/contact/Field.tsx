import styles from '../Contact.module.css';

/**
 * A labelled control and the message that appears when it needs a look.
 *
 * The control is passed in rather than described by props: the three fields
 * differ in type, autocomplete, and element, and threading all of that through
 * would be a larger surface than the markup it replaces.
 */
export default function Field({
  id,
  label,
  problem,
  children,
}: {
  id: string;
  label: string;
  problem?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={styles.label} htmlFor={id}>{label}</label>
      {children}
      {problem ? <p className={styles.problem}>{problem}</p> : null}
    </div>
  );
}
