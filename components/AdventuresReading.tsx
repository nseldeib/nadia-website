import { toReadingLinks, type ReadingEntry } from '@/app/lib/readingLinks';
import WorkLinkList from './work/WorkLinkList';
import styles from './AdventuresReading.module.css';

/**
 * "Read about the running": a mono label over the same ruled list the Work
 * section uses, so the essays read as a footnote to the Adventures prose rather
 * than a new block. Links are internal and open in the same tab. Renders
 * nothing when there are no essays to point to.
 */
export default function AdventuresReading({
  label,
  links,
}: {
  label: string;
  links: ReadingEntry[];
}) {
  if (links.length === 0) return null;
  return (
    <div className={styles.reading}>
      <h3 className={styles.readingLabel}>{label}</h3>
      <WorkLinkList external={false} className={styles.readingList} links={toReadingLinks(links)} />
    </div>
  );
}
