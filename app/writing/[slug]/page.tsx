import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import site from '@/content/site';
import Footer from '@/components/Footer';
import WritingNav from '@/components/writing/WritingNav';
import PostBody from '@/components/writing/PostBody';
import PostFooter from '@/components/writing/PostFooter';
import { adjacentPosts, getPost, reconcileWithinDeadline } from '@/app/lib/posts';
import { excerptFromHtml } from '@/app/lib/sanitizePostHtml';
import { formatPostDateLong } from '@/app/lib/postDates';
import { siteUrl } from '@/app/lib/siteUrl';
import styles from './post.module.css';

export const dynamic = 'force-dynamic';

/**
 * Find a post, reaching for the feed only when the slug is unknown.
 *
 * The archive page reconciles on every visit, so the common case is already
 * stored and costs one query. Syncing here unconditionally would mean twenty
 * upserts on every post view to discover nothing had changed. The one case
 * that genuinely needs the feed is someone opening a link to a post published
 * since this site last looked — so that is the only case that pays for it.
 */
async function findPost(slug: string) {
  const stored = await getPost(slug);
  if (stored) return stored;

  // On a deadline, like the archive: an unknown slug is usually a 404, and a
  // 404 must not take a minute to arrive because Substack was slow to answer.
  await reconcileWithinDeadline();
  return getPost(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) return { title: 'Page not found · Nadia Eldeib' };

  const description = post.subtitle?.trim() || excerptFromHtml(post.bodyHtml, 180);
  const url = siteUrl(`/writing/${post.slug}`);

  return {
    title: `${post.title} · Nadia Eldeib`,
    description,
    // Self-canonical. The same text exists on Substack and their canonical tag
    // is not ours to set, so both sides self-canonicalise and a search engine
    // picks. Pointing this one at Substack would forfeit the whole reason the
    // posts were brought onto this domain.
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: 'Nadia Eldeib',
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound();

  const { previous, next } = await adjacentPosts(post.slug);

  return (
    <>
      <WritingNav current="post" />
      <main>
        <article>
          <header className={styles.header}>
            <div className={styles.headerWrap}>
              <p className={styles.meta}>
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatPostDateLong(post.publishedAt)}
                </time>
              </p>
              <h1 className={styles.title}>{post.title}</h1>
              {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}
            </div>
          </header>

          <PostBody html={post.bodyHtml} />
        </article>

        {/* Credit where it was published, below the essay rather than above it:
            it matters to the reader who wants the original, and not at all to
            the reader who just wants to read. */}
        <p className={styles.origin}>
          Originally published on{' '}
          <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer">
            Substack
          </a>
          .
        </p>

        <PostFooter cta={site.writing.cta} previous={previous} next={next} />
      </main>
      <Footer />
    </>
  );
}
