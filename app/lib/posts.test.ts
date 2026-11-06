import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FeedPost } from './substackFeed';

// The network and the database are mocked so this exercises the reconcile's
// ORCHESTRATION — what is fetched, what is written, what is reported. The
// parsers are tested in substackFeed.test.ts.
const findMany = vi.fn();
const findFirst = vi.fn();
const findUnique = vi.fn();
const upsert = vi.fn();
const create = vi.fn();
const fetchFeed = vi.fn();
const fetchArchiveIndex = vi.fn();
const fetchPostBySlug = vi.fn();

vi.mock('./prisma', () => ({
  prisma: {
    post: {
      findMany: (...a: unknown[]) => findMany(...a),
      findFirst: (...a: unknown[]) => findFirst(...a),
      findUnique: (...a: unknown[]) => findUnique(...a),
      upsert: (...a: unknown[]) => upsert(...a),
      create: (...a: unknown[]) => create(...a),
    },
  },
}));

vi.mock('./substackFeed', () => ({
  FEED_REVALIDATE_SECONDS: 3600,
  fetchFeed: (...a: unknown[]) => fetchFeed(...a),
  fetchArchiveIndex: (...a: unknown[]) => fetchArchiveIndex(...a),
  fetchPostBySlug: (...a: unknown[]) => fetchPostBySlug(...a),
}));

const {
  syncPostsFromFeed,
  selectBackfillCandidates,
  toPostRow,
  reconcileWithinDeadline,
  syncPostsQuietly,
  listPosts,
  recentPostsForHome,
  getPost,
  adjacentPosts,
  allPostSlugs,
} = await import('./posts');

function feedPost(slug: string): FeedPost {
  return {
    slug,
    title: `Title ${slug}`,
    subtitle: null,
    publishedAt: new Date('2026-07-06'),
    canonicalUrl: `https://blog.nseldeib.com/p/${slug}`,
    bodyHtml: '<p>Body</p>',
  };
}

const entry = (slug: string, audience = 'everyone') => ({
  slug,
  audience,
  publishedAt: new Date('2024-07-24'),
});

beforeEach(() => {
  vi.resetAllMocks();
  findMany.mockResolvedValue([]);
  upsert.mockResolvedValue({});
  create.mockResolvedValue({});
});

describe('syncPostsFromFeed backfill', () => {
  // A post absent from RSS but present in Substack's archive must still be stored.
  it('backfills posts that have aged out of the RSS window', async () => {
    fetchFeed.mockResolvedValue({ ok: true, posts: [feedPost('you-can-just-ship-things')] });
    fetchArchiveIndex.mockResolvedValue({
      ok: true,
      entries: [entry('you-can-just-ship-things'), entry('our-vision-for-codeyam-why-build')],
    });
    fetchPostBySlug.mockResolvedValue({ ok: true, post: feedPost('our-vision-for-codeyam-why-build') });

    const result = await syncPostsFromFeed({ force: true });

    expect(result.backfilled).toBe(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'our-vision-for-codeyam-why-build' }) }),
    );
  });

  // Backfill is create-only: a post the store already has must not be
  // re-fetched or overwritten.
  it('skips archive posts the store already holds', async () => {
    fetchFeed.mockResolvedValue({ ok: true, posts: [feedPost('new')] });
    fetchArchiveIndex.mockResolvedValue({ ok: true, entries: [entry('new'), entry('old')] });
    findMany.mockImplementation(async ({ where }: { where: { slug: { in: string[] } } }) =>
      where.slug.in.includes('old') ? [{ slug: 'old' }] : [],
    );

    const result = await syncPostsFromFeed({ force: true });

    expect(result.backfilled).toBe(0);
    expect(fetchPostBySlug).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  // An archive outage must leave the feed results intact and be reported,
  // not thrown.
  it('reports an archive failure without losing the feed results', async () => {
    fetchFeed.mockResolvedValue({ ok: true, posts: [feedPost('a'), feedPost('b')] });
    fetchArchiveIndex.mockResolvedValue({ ok: false, reason: 'archive responded 503' });

    const result = await syncPostsFromFeed({ force: true });

    expect(result).toEqual({ added: 2, updated: 0, backfilled: 0, backfillFailed: 'archive responded 503' });
    expect(upsert).toHaveBeenCalledTimes(2);
  });

  // One post failing to fetch must not stop the others from being stored.
  it('stores the posts it can and reports the ones it cannot', async () => {
    fetchFeed.mockResolvedValue({ ok: true, posts: [] });
    fetchArchiveIndex.mockResolvedValue({ ok: true, entries: [entry('good'), entry('bad')] });
    fetchPostBySlug.mockImplementation(async (slug: string) =>
      slug === 'good' ? { ok: true, post: feedPost('good') } : { ok: false, reason: 'post bad responded 404' },
    );

    const result = await syncPostsFromFeed({ force: true });

    expect(result.backfilled).toBe(1);
    expect(result.backfillFailed).toBe('post bad responded 404');
  });

  // A database error during backfill becomes a reported failure, so the
  // reconcile never throws into a page render.
  it('never throws when a backfill write fails', async () => {
    fetchFeed.mockResolvedValue({ ok: true, posts: [] });
    fetchArchiveIndex.mockResolvedValue({ ok: true, entries: [entry('x')] });
    fetchPostBySlug.mockResolvedValue({ ok: true, post: feedPost('x') });
    create.mockRejectedValue(new Error('connection reset'));

    const result = await syncPostsFromFeed({ force: true });

    expect(result).toMatchObject({ backfilled: 0, backfillFailed: 'connection reset' });
  });

  // A feed failure stops the reconcile before the archive is consulted.
  it('does not backfill when the feed itself fails', async () => {
    fetchFeed.mockResolvedValue({ ok: false, reason: 'feed responded 500' });

    const result = await syncPostsFromFeed({ force: true });

    expect(result).toEqual({ added: 0, updated: 0, backfilled: 0, failed: 'feed responded 500' });
    expect(fetchArchiveIndex).not.toHaveBeenCalled();
  });
});

describe('selectBackfillCandidates', () => {
  // Paid posts must never be mirrored in full on a public site.
  it('keeps only public posts', () => {
    expect(
      selectBackfillCandidates([entry('free'), entry('paid', 'only_paid'), entry('founding', 'founding')], new Set()),
    ).toEqual(['free']);
  });

  // A post in the feed was just upserted, so fetching it again is wasted work.
  it('drops posts already in the feed', () => {
    expect(selectBackfillCandidates([entry('a'), entry('b')], new Set(['a']))).toEqual(['b']);
  });

  // An empty archive yields nothing to fetch.
  it('returns nothing for an empty archive', () => {
    expect(selectBackfillCandidates([], new Set(['a']))).toEqual([]);
  });
});

describe('toPostRow', () => {
  // Every stored body goes through the sanitizer — Substack chrome must never
  // reach the database by either path.
  it('sanitizes the body and keeps every other field', () => {
    const row = toPostRow({ ...feedPost('s'), bodyHtml: '<p>Hi</p><form><input></form><button>x</button>' });
    expect(row).toMatchObject({ slug: 's', title: 'Title s', subtitle: null, canonicalUrl: 'https://blog.nseldeib.com/p/s' });
    expect(row.bodyHtml).toContain('<p>Hi</p>');
    expect(row.bodyHtml).not.toMatch(/<form|<input|<button/);
  });
});

// storeIsFresh is private; it is exercised through syncPostsFromFeed's skip.
describe('storeIsFresh via syncPostsFromFeed', () => {
  // A fresh store must not pay for a feed fetch and twenty upserts.
  it('skips the feed when the newest row was updated within the revalidate window', async () => {
    findFirst.mockResolvedValue({ updatedAt: new Date(Date.now() - 60_000) });

    const res = await syncPostsFromFeed();

    expect(res).toEqual({ added: 0, updated: 0, backfilled: 0, skipped: true });
    expect(fetchFeed).not.toHaveBeenCalled();
  });

  // A stale store must reconcile.
  it('consults the feed when the newest row is older than the window', async () => {
    findFirst.mockResolvedValue({ updatedAt: new Date(Date.now() - 2 * 3600_000) });
    fetchFeed.mockResolvedValue({ ok: false, reason: 'down' });

    expect(await syncPostsFromFeed()).toMatchObject({ failed: 'down' });
    expect(fetchFeed).toHaveBeenCalledOnce();
  });

  // An empty store has nothing to serve, so it must reconcile.
  it('consults the feed when the store is empty', async () => {
    findFirst.mockResolvedValue(null);
    fetchFeed.mockResolvedValue({ ok: false, reason: 'down' });

    await syncPostsFromFeed();
    expect(fetchFeed).toHaveBeenCalledOnce();
  });
});

describe('reconcileWithinDeadline', () => {
  // A reconcile that beats the deadline reports its real result.
  it('returns the sync result when it finishes in time', async () => {
    findFirst.mockResolvedValue({ updatedAt: new Date() });
    expect(await reconcileWithinDeadline(1000)).toMatchObject({ skipped: true });
  });

  // A slow Substack must not hold a render past the deadline.
  it('stops waiting at the deadline', async () => {
    findFirst.mockReturnValue(new Promise(() => {}));
    expect(await reconcileWithinDeadline(5)).toEqual({ timedOut: true });
  });

  // A thrown reconcile must not take the page down.
  it('turns a thrown reconcile into a failed result', async () => {
    findFirst.mockRejectedValue(new Error('db unreachable'));
    const res = await reconcileWithinDeadline(1000);
    expect(res).toMatchObject({ added: 0, updated: 0, backfilled: 0 });
    expect('failed' in res && res.failed).toContain('db unreachable');
  });
});

describe('syncPostsQuietly', () => {
  // A healthy reconcile still writes: quiet must not mean skipped.
  it('runs the reconcile and resolves to nothing', async () => {
    findFirst.mockResolvedValue(null);
    fetchFeed.mockResolvedValue({ ok: true, posts: [feedPost('fresh')] });
    fetchArchiveIndex.mockResolvedValue({ ok: false, reason: 'down' });

    await expect(syncPostsQuietly()).resolves.toBeUndefined();
    expect(upsert).toHaveBeenCalledOnce();
  });

  // A fresh store costs nothing, exactly as the unwrapped reconcile.
  it('respects the freshness skip', async () => {
    findFirst.mockResolvedValue({ updatedAt: new Date() });

    await expect(syncPostsQuietly()).resolves.toBeUndefined();
    expect(fetchFeed).not.toHaveBeenCalled();
  });

  // Runs after the response is sent, so a thrown reconcile must not escape
  // as an unhandled rejection.
  it('swallows a thrown reconcile', async () => {
    findFirst.mockRejectedValue(new Error('db unreachable'));

    await expect(syncPostsQuietly()).resolves.toBeUndefined();
  });

  // A failure partway through writing is swallowed too.
  it('swallows a failed write after the feed was fetched', async () => {
    findFirst.mockResolvedValue(null);
    fetchFeed.mockResolvedValue({ ok: true, posts: [feedPost('fresh')] });
    upsert.mockRejectedValue(new Error('write failed'));

    await expect(syncPostsQuietly()).resolves.toBeUndefined();
  });
});

describe('listPosts', () => {
  // Lists never load the 48K-character body.
  it('reads newest first without the body, uncapped by default', async () => {
    findMany.mockResolvedValue([{ slug: 'a' }]);

    expect(await listPosts()).toEqual([{ slug: 'a' }]);
    const query = findMany.mock.calls[0][0];
    expect(query.orderBy).toEqual({ publishedAt: 'desc' });
    expect(query.select.bodyHtml).toBeUndefined();
    expect(query.take).toBeUndefined();
  });

  // The homepage asks for a capped list.
  it('applies a limit when given one', async () => {
    await listPosts(3);
    expect(findMany.mock.calls[0][0].take).toBe(3);
  });
});

describe('recentPostsForHome', () => {
  // The homepage shows three posts by default.
  it('returns the three most recent posts', async () => {
    findMany.mockResolvedValue([{ slug: 'a' }]);
    expect(await recentPostsForHome()).toEqual([{ slug: 'a' }]);
    expect(findMany.mock.calls[0][0].take).toBe(3);
  });

  // An unreachable database must cost the homepage one section, not the page.
  it('returns an empty list instead of throwing', async () => {
    findMany.mockRejectedValue(new Error('db down'));
    expect(await recentPostsForHome()).toEqual([]);
  });
});

describe('getPost', () => {
  // Post pages read one row by its Substack slug.
  it('looks a post up by slug', async () => {
    findUnique.mockResolvedValue({ slug: 'a' });
    expect(await getPost('a')).toEqual({ slug: 'a' });
    expect(findUnique).toHaveBeenCalledWith({ where: { slug: 'a' } });
  });
});

describe('adjacentPosts', () => {
  // No neighbour queries run for a post that does not exist.
  it('returns nulls for an unknown slug', async () => {
    findUnique.mockResolvedValue(null);
    expect(await adjacentPosts('nope')).toEqual({ previous: null, next: null });
    expect(findFirst).not.toHaveBeenCalled();
  });

  // Direction matches the archive order the reader came from.
  it('previous is the next-older post and next is the next-newer one', async () => {
    const at = new Date('2026-03-01');
    findUnique.mockResolvedValue({ publishedAt: at });
    findFirst.mockImplementation(async (q: { where: { publishedAt: { lt?: Date; gt?: Date } } }) =>
      q.where.publishedAt.lt ? { slug: 'older' } : { slug: 'newer' },
    );

    expect(await adjacentPosts('mid')).toEqual({ previous: { slug: 'older' }, next: { slug: 'newer' } });

    const [olderQ, newerQ] = findFirst.mock.calls.map((c) => c[0]);
    expect(olderQ).toMatchObject({ where: { publishedAt: { lt: at } }, orderBy: { publishedAt: 'desc' } });
    expect(newerQ).toMatchObject({ where: { publishedAt: { gt: at } }, orderBy: { publishedAt: 'asc' } });
  });
});

describe('allPostSlugs', () => {
  // The sitemap and static params list every stored post.
  it('returns every stored slug, newest first', async () => {
    findMany.mockResolvedValue([{ slug: 'b' }, { slug: 'a' }]);
    expect(await allPostSlugs()).toEqual(['b', 'a']);
    expect(findMany.mock.calls[0][0].orderBy).toEqual({ publishedAt: 'desc' });
  });
});
