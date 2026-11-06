import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  API_BASE,
  ARCHIVE_MAX_PAGES,
  ARCHIVE_PAGE_SIZE,
  archivePageUrl,
  fetchArchiveIndex,
  fetchPostBySlug,
  fetchFeed,
  parseApiPost,
  parseArchive,
  parseFeed,
  slugFromLink,
} from './substackFeed';

describe('parseArchive', () => {
  // The live archive response shape (verified 2026-11-05): a `posts` array and
  // an opaque `nextCursor`. Both halves must come through or pagination stops.
  it('reads entries and the next cursor from one page', () => {
    const page = parseArchive({
      posts: [
        { slug: 'a', audience: 'everyone', post_date: '2026-07-06T12:00:00.000Z' },
        { slug: 'b', audience: 'only_paid', post_date: '2024-05-06T12:00:00.000Z' },
      ],
      nextCursor: 'abc123',
    });
    expect(page.nextCursor).toBe('abc123');
    expect(page.entries).toEqual([
      { slug: 'a', audience: 'everyone', publishedAt: new Date('2026-07-06T12:00:00.000Z') },
      { slug: 'b', audience: 'only_paid', publishedAt: new Date('2024-05-06T12:00:00.000Z') },
    ]);
  });

  // The last page carries a null cursor; that is the only stop signal besides
  // the page ceiling.
  it('reports no next cursor on the last page', () => {
    expect(parseArchive({ posts: [], nextCursor: null }).nextCursor).toBeNull();
    expect(parseArchive({ posts: [], nextCursor: '' }).nextCursor).toBeNull();
  });

  // An entry without audience must be skipped, never defaulted — a paid post
  // treated as public would be mirrored in full.
  it('skips entries missing slug, audience or a valid date', () => {
    const page = parseArchive({
      posts: [
        { audience: 'everyone', post_date: '2026-01-01' },
        { slug: 'no-audience', post_date: '2026-01-01' },
        { slug: 'bad-date', audience: 'everyone', post_date: 'not a date' },
        { slug: 'ok', audience: 'everyone', post_date: '2026-01-01' },
      ],
    });
    expect(page.entries.map((e) => e.slug)).toEqual(['ok']);
  });

  // An API change or an error body must degrade to "nothing listed", not throw
  // mid-reconcile.
  it('returns nothing for a body that is not an archive page', () => {
    expect(parseArchive(null)).toEqual({ entries: [], nextCursor: null });
    expect(parseArchive({ error: 'Invalid value' })).toEqual({ entries: [], nextCursor: null });
    expect(parseArchive({ posts: 'nope' })).toEqual({ entries: [], nextCursor: null });
  });
});

describe('parseApiPost', () => {
  const full = {
    slug: 'our-vision-for-codeyam-why-build',
    title: '  Our vision  ',
    subtitle: '  Why build  ',
    post_date: '2024-07-24T12:00:00.000Z',
    canonical_url: 'https://blog.nseldeib.com/p/our-vision-for-codeyam-why-build',
    body_html: '<p>Hello</p>',
    audience: 'everyone',
  };

  // The single-post response must map onto the same shape the RSS produces,
  // so both paths store identical rows.
  it('maps a complete post onto the feed shape', () => {
    expect(parseApiPost(full)).toEqual({
      slug: 'our-vision-for-codeyam-why-build',
      title: 'Our vision',
      subtitle: 'Why build',
      publishedAt: new Date('2024-07-24T12:00:00.000Z'),
      canonicalUrl: 'https://blog.nseldeib.com/p/our-vision-for-codeyam-why-build',
      bodyHtml: '<p>Hello</p>',
    });
  });

  // A blank or missing subtitle is stored as null, matching the feed parser.
  it('turns a blank subtitle into null', () => {
    expect(parseApiPost({ ...full, subtitle: '   ' })?.subtitle).toBeNull();
    expect(parseApiPost({ ...full, subtitle: undefined })?.subtitle).toBeNull();
  });

  // A post without a body would render as an empty page — refuse it so the
  // failure is reported instead of stored.
  it('rejects a post missing any required field', () => {
    for (const key of ['slug', 'title', 'post_date', 'canonical_url', 'body_html']) {
      expect(parseApiPost({ ...full, [key]: undefined })).toBeNull();
    }
  });

  // An error body or null must not throw.
  it('rejects a body that is not a post', () => {
    expect(parseApiPost(null)).toBeNull();
    expect(parseApiPost({ error: 'Not found' })).toBeNull();
  });
});

describe('archivePageUrl', () => {
  // The first page has no cursor and asks for the largest page the API accepts.
  it('builds the first page URL without a cursor', () => {
    expect(archivePageUrl(null)).toBe(`${API_BASE}/archive?sort=new&limit=${ARCHIVE_PAGE_SIZE}`);
  });

  // Later pages pass the opaque cursor through, encoded so a cursor with
  // reserved characters cannot corrupt the query string.
  it('appends an encoded cursor for later pages', () => {
    expect(archivePageUrl('a+b/c=')).toBe(
      `${API_BASE}/archive?sort=new&limit=${ARCHIVE_PAGE_SIZE}&cursor=a%2Bb%2Fc%3D`,
    );
  });

  // The API rejects limits above 25; the constant must stay within that.
  it('never asks for more than the API accepts', () => {
    expect(ARCHIVE_PAGE_SIZE).toBeLessThanOrEqual(25);
  });
});

describe('fetchArchiveIndex', () => {
  const page = (slugs: string[], nextCursor: string | null) => ({
    posts: slugs.map((slug) => ({ slug, audience: 'everyone', post_date: '2026-01-01' })),
    nextCursor,
  });
  const respond = (status: number, body: unknown) =>
    ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

  afterEach(() => vi.unstubAllGlobals());

  // The archive is cursor-paginated; every page must be walked or older posts
  // are never discovered.
  it('walks the cursor until the last page', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes('cursor=c1') ? respond(200, page(['b'], null)) : respond(200, page(['a'], 'c1')),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchArchiveIndex();

    expect(res).toMatchObject({ ok: true });
    expect(res.ok && res.entries.map((e) => e.slug)).toEqual(['a', 'b']);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  // A later page failing still yields what was gathered, so a flaky archive
  // backfills something now and the rest next time.
  it('returns a partial list when a later page fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.includes('cursor=') ? respond(503, {}) : respond(200, page(['a'], 'c1')),
      ),
    );

    const res = await fetchArchiveIndex();

    expect(res.ok && res.entries.map((e) => e.slug)).toEqual(['a']);
  });

  // A first-page failure is a real failure and must be reported, not hidden
  // as an empty archive.
  it('fails when the first page fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respond(500, {})));

    const res = await fetchArchiveIndex();

    expect(res.ok).toBe(false);
    expect(!res.ok && res.reason).toContain('500');
  });

  // A cursor that never ends must not turn a page render into an unbounded crawl.
  it('stops at the page ceiling', async () => {
    const fetchMock = vi.fn(async () => respond(200, page(['x'], 'forever')));
    vi.stubGlobal('fetch', fetchMock);

    await fetchArchiveIndex();

    expect(fetchMock).toHaveBeenCalledTimes(ARCHIVE_MAX_PAGES);
  });

  // A network error is converted to a result, never thrown into the caller.
  it('never throws on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNRESET'); }));

    expect(await fetchArchiveIndex()).toEqual({ ok: false, reason: 'ECONNRESET' });
  });
});

describe('fetchPostBySlug', () => {
  const respond = (status: number, body: unknown) =>
    ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

  afterEach(() => vi.unstubAllGlobals());

  // The single-post endpoint is how an aged-out post's body is recovered.
  it('returns the parsed post', async () => {
    const fetchMock = vi.fn(async (_url: string) =>
      respond(200, {
        slug: 'old',
        title: 'Old',
        post_date: '2024-05-06',
        canonical_url: 'https://blog.nseldeib.com/p/old',
        body_html: '<p>x</p>',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchPostBySlug('old');

    expect(res.ok && res.post.slug).toBe('old');
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE}/posts/old`);
  });

  // A missing post is reported with its status so the sync result says why.
  it('reports a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respond(404, {})));

    const res = await fetchPostBySlug('gone');

    expect(!res.ok && res.reason).toContain('404');
  });

  // A response without a body must not be stored as an empty post.
  it('reports a post missing required fields', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respond(200, { slug: 'thin' })));

    expect(await fetchPostBySlug('thin')).toEqual({ ok: false, reason: 'post thin missing required fields' });
  });
});

describe('slugFromLink', () => {
  // Site URLs mirror the Substack slug a reader may already have.
  it('takes the slug Substack already uses', () => {
    expect(slugFromLink('https://blog.nseldeib.com/p/you-can-just-ship-things')).toBe(
      'you-can-just-ship-things',
    );
  });

  // Tracking parameters and anchors are not part of the slug.
  it('ignores a query string or fragment', () => {
    expect(slugFromLink('https://blog.nseldeib.com/p/a-post?utm=x')).toBe('a-post');
    expect(slugFromLink('https://blog.nseldeib.com/p/a-post#footnote')).toBe('a-post');
  });

  // Non-post Substack pages yield no slug.
  it('returns null for a link that is not a post', () => {
    expect(slugFromLink('https://blog.nseldeib.com/about')).toBeNull();
  });
});

// parseDate, asArray and asText are private; they are exercised through
// parseFeed's handling of dates, single-vs-many items, and text nodes.
describe('parseFeed', () => {
  const item = ({
    link = 'https://blog.nseldeib.com/p/first',
    title = '<![CDATA[First post]]>',
    pubDate = 'Mon, 06 Jul 2026 12:00:00 GMT',
    description = '<![CDATA[A subtitle]]>',
    body = '<![CDATA[<p>Body</p>]]>',
  }: Partial<Record<'link' | 'title' | 'pubDate' | 'description' | 'body', string>> = {}) =>
    `<item><title>${title}</title><link>${link}</link><pubDate>${pubDate}</pubDate>` +
    `<description>${description}</description><content:encoded>${body}</content:encoded></item>`;
  const rss = (...items: string[]) =>
    `<?xml version="1.0"?><rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>${items.join('')}</channel></rss>`;

  // A one-post feed must not be lost to the bare-object shape.
  it('parses a single item, which fast-xml-parser hands back as a bare object', () => {
    const posts = parseFeed(rss(item()));

    expect(posts).toEqual([
      {
        slug: 'first',
        title: 'First post',
        subtitle: 'A subtitle',
        publishedAt: new Date('2026-07-06T12:00:00Z'),
        canonicalUrl: 'https://blog.nseldeib.com/p/first',
        bodyHtml: '<p>Body</p>',
      },
    ]);
  });

  // Multiple items keep the feed's order.
  it('parses many items in feed order', () => {
    const posts = parseFeed(
      rss(item({ link: 'https://blog.nseldeib.com/p/a' }), item({ link: 'https://blog.nseldeib.com/p/b' })),
    );
    expect(posts.map((p) => p.slug)).toEqual(['a', 'b']);
  });

  // A blank description is no subtitle, not an empty one.
  it('stores an empty description as a null subtitle', () => {
    expect(parseFeed(rss(item({ description: '' })))[0].subtitle).toBeNull();
  });

  // One bad item costs one post, not the archive.
  it('skips items missing a slug, title, date, or body', () => {
    const posts = parseFeed(
      rss(
        item({ link: 'https://blog.nseldeib.com/about' }),
        item({ link: 'https://blog.nseldeib.com/p/no-title', title: '' }),
        item({ link: 'https://blog.nseldeib.com/p/bad-date', pubDate: 'not a date' }),
        item({ link: 'https://blog.nseldeib.com/p/no-body', body: '' }),
        item({ link: 'https://blog.nseldeib.com/p/good' }),
      ),
    );
    expect(posts.map((p) => p.slug)).toEqual(['good']);
  });

  // Empty or foreign XML yields no posts rather than throwing.
  it('returns nothing for a feed with no items or non-feed XML', () => {
    expect(parseFeed(rss())).toEqual([]);
    expect(parseFeed('<html></html>')).toEqual([]);
  });
});

describe('fetchFeed', () => {
  afterEach(() => vi.unstubAllGlobals());

  const xml =
    '<rss><channel><item><title>T</title><link>https://blog.nseldeib.com/p/t</link>' +
    '<pubDate>Mon, 06 Jul 2026 12:00:00 GMT</pubDate><content:encoded>&lt;p&gt;B&lt;/p&gt;</content:encoded></item></channel></rss>';

  // A healthy feed response becomes posts.
  it('returns the parsed posts on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, text: async () => xml }) as Response));

    const res = await fetchFeed('https://example.test/feed');

    expect(res.ok && res.posts.map((p) => p.slug)).toEqual(['t']);
  });

  // An HTTP error is a reason, not an exception.
  it('reports a non-2xx status without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 }) as Response));
    expect(await fetchFeed()).toEqual({ ok: false, reason: 'feed responded 503' });
  });

  // A feed that parses to nothing is reported, not silently stored as empty.
  it('treats a feed with no usable posts as a failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, text: async () => '<rss/>' }) as Response));
    expect(await fetchFeed()).toEqual({ ok: false, reason: 'feed parsed but contained no usable posts' });
  });

  // A network failure is reported as a reason; callers serve what is stored.
  it('never throws on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNRESET'); }));
    const res = await fetchFeed();
    expect(res.ok).toBe(false);
    expect(!res.ok && res.reason).toContain('ECONNRESET');
  });
});
