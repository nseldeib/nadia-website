import type { Metadata } from 'next';
import site from '@/content/site';
import Footer from '@/components/Footer';
import WritingNav from '@/components/writing/WritingNav';
import ArchiveList from '@/components/writing/ArchiveList';
import WritingCta from '@/components/writing/WritingCta';
import { listPosts, reconcileWithinDeadline } from '@/app/lib/posts';
import { siteUrl } from '@/app/lib/siteUrl';
import styles from './writing.module.css';

/* Rendered per request so a scenario's seeded rows are the rows this page
   shows. A cached render would hand every scenario whichever world happened to
   be seeded when the page was first built. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Writing · Nadia Eldeib',
  description: site.writing.lede,
  alternates: { canonical: siteUrl('/writing') },
  openGraph: {
    title: 'Writing · Nadia Eldeib',
    description: site.writing.lede,
    url: siteUrl('/writing'),
    siteName: 'Nadia Eldeib',
    type: 'website',
  },
};

export default async function WritingArchivePage() {
  // Reconcile before reading, but on a deadline. The feed brings in anything
  // published since the last visit; a failure OR a slow feed is not an error
  // state — it means this render serves what is already stored, which for a
  // returning reader is everything.
  await reconcileWithinDeadline();
  const posts = await listPosts();

  return (
    <>
      <WritingNav current="archive" />
      <main className={styles.page}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Writing</p>
          <h1 className={styles.heading}>{site.writing.heading}</h1>
          <p className={styles.lede}>{site.writing.lede}</p>

          {posts.length > 0 ? (
            <ArchiveList posts={posts} />
          ) : (
            /* Day one, or a Substack that cannot be reached before anything has
               been stored. Neither is an error worth showing a reader, so the
               page says what the writing is and offers the way to it. */
            <p className={styles.empty}>
              The archive is loading from the newsletter. In the meantime, everything is
              readable on Substack.
            </p>
          )}

          <WritingCta cta={site.writing.cta} />
        </div>
      </main>
      <Footer />
    </>
  );
}
