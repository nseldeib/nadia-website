import styles from '../Contact.module.css';

/** Hidden from people, irresistible to bots. A filled value is answered silently. */
export default function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={styles.trap} aria-hidden="true">
      <label htmlFor="company">Company</label>
      <input id="company" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
    </div>
  );
}
