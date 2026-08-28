import styles from '../Contact.module.css';
import SocialList from './SocialList';

/**
 * Where else to find her.
 *
 * It shares the section with the form rather than standing alone: both answer
 * the same reader question, so they should not compete as two destinations.
 *
 * Her city and timezone used to close this block, which left them reading as a
 * footnote to the profile list and stranded them a long way from the send
 * button they qualify. They now sit beside that button, in SubmitRow.
 */
export default function FindMe({
  heading,
  socials,
}: {
  heading: string;
  socials: { href: string; name: string; handle: string }[];
}) {
  return (
    <div className={styles.findMe}>
      <h3 className={styles.findMeHeading}>{heading}</h3>
      <SocialList socials={socials} />
    </div>
  );
}
