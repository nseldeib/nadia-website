import section from '../Section.module.css';
import styles from '../Work.module.css';
import WorkLinkList from './WorkLinkList';

/**
 * The prose column.
 *
 * The first paragraph is the north star and leads; the subhead then names what
 * she is building, so the reader has the why before the what.
 */
export default function WorkNarrative({
  paragraphs,
  subhead,
  links,
  proof,
}: {
  paragraphs: string[];
  subhead: string;
  links: { href: string; label: string; host?: string }[];
  proof: string;
}) {
  const [northStar, ...rest] = paragraphs;

  return (
    <div className={section.body}>
      <p>{northStar}</p>
      <p className={styles.subhead}>{subhead}</p>
      {rest.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
      <WorkLinkList links={links} />
      <p className={styles.proof}>{proof}</p>
    </div>
  );
}
