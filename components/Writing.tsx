import Link from 'next/link';
import site from '@/content/site';
import type { PostSummary } from '@/app/lib/posts';
import SectionHead from './SectionHead';
import PostList from './writing/PostList';
import WritingIntro from './writing/WritingIntro';
import WritingCta from './writing/WritingCta';
import section from './Section.module.css';
import styles from './Writing.module.css';

/**
 * Section 03, now a doorway into the writing rather than an exit to Substack.
 *
 * The posts arrive as a prop rather than being read here, so the section stays
 * a pure render — which is what lets an isolated scenario show it with twenty
 * posts, three, or none without a database behind it.
 */
export default function Writing({ posts }: { posts: PostSummary[] }) {
  const { writing } = site;

  return (
    <section className={section.section} id="writing">
      <div className={section.wrap}>
        <SectionHead n={writing.number} eyebrow={writing.eyebrow} />
        <h2 className={section.heading}>{writing.heading}</h2>
        <WritingIntro lede={writing.lede} />

        <PostList posts={posts} />

        {/* Quiet, and only when there is an archive to go to. It sits between
            the list and the newsletter CTA because it belongs to the list —
            it is "more of these", not a second thing to sign up for. */}
        {posts.length > 0 && (
          <Link className={styles.archiveLink} href="/writing">
            All writing
          </Link>
        )}

        <WritingCta cta={writing.cta} />
      </div>
    </section>
  );
}
