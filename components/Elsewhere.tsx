import site from '@/content/site';
import SectionHead from './SectionHead';
import ElsewhereRow from './elsewhere/ElsewhereRow';
import section from './Section.module.css';
import styles from './Elsewhere.module.css';

/** Newest first — a timeline, not a filing cabinet grouped by kind. */
export default function Elsewhere() {
  const { elsewhere } = site;

  return (
    <section className={section.section} id="elsewhere">
      <div className={section.wrap}>
        <SectionHead n={elsewhere.number} eyebrow={elsewhere.eyebrow} />
        <h2 className={section.heading}>{elsewhere.heading}</h2>

        <ul className={styles.rows}>
          {elsewhere.rows.map((r) => (
            <ElsewhereRow key={r.href} row={r} />
          ))}
        </ul>
        <p className={styles.note}>{elsewhere.note}</p>
      </div>
    </section>
  );
}
