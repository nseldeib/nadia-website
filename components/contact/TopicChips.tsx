import styles from '../Contact.module.css';

/** The closed set of reasons someone might be writing. */
export default function TopicChips({
  legend,
  topics,
  value,
  onChange,
}: {
  legend: string;
  topics: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.chips}>
        {topics.map((t) => (
          <label key={t.id} className={styles.chip}>
            <input
              type="radio"
              name="topic"
              value={t.id}
              checked={value === t.id}
              onChange={() => onChange(t.id)}
            />
            <span>{t.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
