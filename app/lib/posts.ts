// The site's view of the writing: the feed reconciled against what is stored.
//
// The whole reason this layer exists is a limit in Substack's RSS: it returns
// only the 20 most recent posts. Today that is the entire archive, so nothing
// is missing — but the 21st post published pushes the first one out of the
// feed, and a site that rendered the feed directly would lose it silently.
//
// So: the feed is the source of NEW posts, and the database is the memory of
// OLD ones. A post is written the first time it is seen and is never removed
// when it leaves the feed window. Reconciling is additive, always.

import { prisma } from './prisma';
import { fetchFeed, FEED_REVALIDATE_SECONDS } from './substackFeed';
import { sanitizePostHtml } from './sanitizePostHtml';

/** What a reconcile did, so a caller can log or display it without guessing. */
export type SyncResult = {
  added: number;
  updated: number;
  /** Set when the feed could not be read. Stored posts are still served. */
  failed?: string;
  /** Set when the store was recent enough that the feed was not consulted. */
  skipped?: true;
};

/**
 * Whether the store is recent enough to serve without consulting the feed.
 *
 * Without this, every page that wants posts pays twenty upserts to discover
 * nothing changed. The feed's HTTP response is already cached for an hour by
 * Next, but the database round-trips are not, and they are the expensive half.
 */
async function storeIsFresh(): Promise<boolean> {
  const newest = await prisma.post.findFirst({
    select: { updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });
  if (!newest) return false;

  const ageSeconds = (Date.now() - newest.updatedAt.getTime()) / 1000;
  return ageSeconds < FEED_REVALIDATE_SECONDS;
}

/**
 * Bring the store up to date with the feed.
 *
 * Two properties matter here and are worth stating:
 *
 * 1. It never deletes. A post absent from the feed has aged out of Substack's
 *    20-item window, not been retracted, and dropping it would defeat the only
 *    reason this table exists.
 * 2. It updates in place. A post still in the feed has its title, subtitle and
 *    body refreshed, so a typo fixed on Substack propagates here rather than
 *    freezing whatever was true the first morning it was seen.
 */
export async function syncPostsFromFeed(
  { force = false }: { force?: boolean } = {},
): Promise<SyncResult> {
  if (!force && (await storeIsFresh())) return { added: 0, updated: 0, skipped: true };

  const feed = await fetchFeed();
  if (!feed.ok) return { added: 0, updated: 0, failed: feed.reason };

  const rows = feed.posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    publishedAt: post.publishedAt,
    canonicalUrl: post.canonicalUrl,
    bodyHtml: sanitizePostHtml(post.bodyHtml),
  }));

  // One query to learn what is already known, so `added` and `updated` can be
  // reported without asking the database about each slug individually.
  const known = new Set(
    (
      await prisma.post.findMany({
        where: { slug: { in: rows.map((r) => r.slug) } },
        select: { slug: true },
      })
    ).map((row) => row.slug),
  );

  // Bounded concurrency rather than a serial loop. Postgres is in another
  // region, so twenty sequential round trips cost seconds of wall clock for
  // work that has no ordering constraint. Bounded rather than unbounded
  // because the connection pool is small and twenty at once would queue anyway.
  const CONCURRENCY = 5;
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    await Promise.all(
      rows.slice(i, i + CONCURRENCY).map(({ slug, ...fields }) =>
        prisma.post.upsert({
          where: { slug },
          create: { slug, ...fields },
          update: fields,
        }),
      ),
    );
  }

  const added = rows.filter((row) => !known.has(row.slug)).length;
  return { added, updated: rows.length - added };
}

/**
 * How long a page render will spend reconciling before it gives up and draws.
 *
 * Reconciling is an optimisation — it brings in posts published since the last
 * visit — and an optimisation must never be able to hold a page open. It has
 * already done so once: with the feed reachable only slowly through the
 * editor's HTTPS proxy, `/writing` returned 200 after ninety seconds, and the
 * render finished only because the client had already given up waiting.
 */
export const RECONCILE_DEADLINE_MS = 2500;

/**
 * Reconcile, but never for longer than the deadline.
 *
 * A reconcile still running when the deadline passes is not cancelled — its
 * writes are useful and will land for the next visitor. It simply stops being
 * something this render waits for.
 */
export async function reconcileWithinDeadline(
  deadlineMs = RECONCILE_DEADLINE_MS,
): Promise<SyncResult | { timedOut: true }> {
  return Promise.race([
    syncPostsFromFeed().catch((err) => ({
      added: 0,
      updated: 0,
      failed: err instanceof Error ? err.message : 'reconcile failed',
    })),
    new Promise<{ timedOut: true }>((resolve) =>
      setTimeout(() => resolve({ timedOut: true }), deadlineMs),
    ),
  ]);
}

/** The columns a list needs — never the body, which runs to 48K characters. */
const LIST_FIELDS = {
  slug: true,
  title: true,
  subtitle: true,
  publishedAt: true,
  canonicalUrl: true,
} as const;

export type PostSummary = {
  slug: string;
  title: string;
  subtitle: string | null;
  publishedAt: Date;
  canonicalUrl: string;
};

/**
 * Posts newest first, optionally capped.
 *
 * Reads the store, never the feed — so a Substack outage costs nothing once a
 * post has been seen once.
 */
export async function listPosts(limit?: number): Promise<PostSummary[]> {
  return prisma.post.findMany({
    select: LIST_FIELDS,
    orderBy: { publishedAt: 'desc' },
    ...(limit ? { take: limit } : {}),
  });
}

/**
 * Recent posts for the homepage, guaranteed not to throw.
 *
 * The homepage was a static page with no database behind it until the writing
 * section started reading real posts. That must not become a way for the whole
 * site to go down: an unreachable Postgres should cost the reader three links
 * in one section, not the page. Every other surface here is allowed to fail
 * loudly; this one is not.
 *
 * It reads and never reconciles. Syncing here made the homepage wait on a
 * 640KB feed fetch plus a round trip per post to a database in another region,
 * which pushed first render past fifteen seconds and failed the dev server's
 * own health check. The archive and the post pages reconcile; the front door
 * only ever reads what they left behind.
 */
export async function recentPostsForHome(limit = 3): Promise<PostSummary[]> {
  try {
    return await listPosts(limit);
  } catch {
    return [];
  }
}

/** One post with its body, or null when the slug is unknown. */
export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

/**
 * The posts on either side of this one, in reading order.
 *
 * `previous` is older and `next` is newer, which is the direction the archive
 * is ordered in — so "next" always means further down the list the reader just
 * came from, not further into the future.
 */
export async function adjacentPosts(
  slug: string,
): Promise<{ previous: PostSummary | null; next: PostSummary | null }> {
  const current = await prisma.post.findUnique({
    where: { slug },
    select: { publishedAt: true },
  });
  if (!current) return { previous: null, next: null };

  const [previous, next] = await Promise.all([
    prisma.post.findFirst({
      select: LIST_FIELDS,
      where: { publishedAt: { lt: current.publishedAt } },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.post.findFirst({
      select: LIST_FIELDS,
      where: { publishedAt: { gt: current.publishedAt } },
      orderBy: { publishedAt: 'asc' },
    }),
  ]);

  return { previous, next };
}

/** Every slug in the store — for the sitemap and for static params. */
export async function allPostSlugs(): Promise<string[]> {
  const rows = await prisma.post.findMany({
    select: { slug: true },
    orderBy: { publishedAt: 'desc' },
  });
  return rows.map((r) => r.slug);
}
