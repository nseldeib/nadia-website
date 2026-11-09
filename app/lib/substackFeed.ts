// Reading the Substack at blog.nseldeib.com as a data source.
//
// This module knows two things and nothing else: where the feed is, and how to
// turn its XML into plain objects. It does no sanitizing (see
// `sanitizePostHtml.ts`) and touches no database (see `posts.ts`), so the
// parsing can be exercised against a fixture without a network or a Postgres.
//
// The failure shape is deliberately a result union rather than a thrown error,
// matching `sendNotification.ts`: a Substack outage must degrade the writing
// pages to whatever is already stored, never take them down. A `fetch` that
// throws mid-render would do the latter.

import { XMLParser } from 'fast-xml-parser';
import { describeError } from './describeError';

/** The only feed this site reads. */
export const FEED_URL = 'https://blog.nseldeib.com/feed';

/**
 * How long a fetched feed stays fresh.
 *
 * The feed is ~640KB, so re-fetching it per request would be absurd for content
 * that changes at most weekly. An hour is short enough that a new post appears
 * the same morning it goes out.
 */
export const FEED_REVALIDATE_SECONDS = 3600;

/**
 * How long a render will wait for Substack before giving up on it.
 *
 * The feed is ~640KB and reaching it can be slow — through the editor's own
 * HTTPS proxy in development it has taken the better part of a minute. A
 * reader waiting on the archive must not inherit that: the whole point of
 * storing posts is that the site can answer without Substack, so a slow feed
 * degrades to "serve what is stored" exactly like an unreachable one.
 */
export const FEED_TIMEOUT_MS = 8000;

/** One post as the feed describes it — body still raw Substack HTML. */
export type FeedPost = {
  slug: string;
  title: string;
  subtitle: string | null;
  publishedAt: Date;
  canonicalUrl: string;
  bodyHtml: string;
  /** The post's cover image, the picture its share card shows; null when none. */
  coverImageUrl: string | null;
};

export type FeedResult = { ok: true; posts: FeedPost[] } | { ok: false; reason: string };

/**
 * The slug Substack already uses, taken from the post's own URL.
 *
 * Reusing it rather than slugifying the title is what makes
 * `/writing/you-can-just-ship-things` the obvious counterpart to a link someone
 * already shared, and it stays stable when a title is edited.
 */
export function slugFromLink(link: string): string | null {
  const match = /\/p\/([^/?#]+)/.exec(link);
  return match ? match[1] : null;
}

/** Substack sends RFC-822 dates; anything unparseable is treated as missing. */
function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** fast-xml-parser hands back a bare value for a single child, an array for many. */
function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** A node that may be text, a number, or an object carrying `#text`. */
function asText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && '#text' in (value as Record<string, unknown>)) {
    return asText((value as Record<string, unknown>)['#text']);
  }
  return '';
}

/**
 * The cover image Substack attaches to an item as `<enclosure type="image/…">`.
 *
 * Only an image enclosure counts: a podcast post's enclosure is its audio.
 */
function coverFromEnclosure(value: unknown): string | null {
  for (const enclosure of asArray(value as Record<string, unknown> | Record<string, unknown>[] | undefined)) {
    const type = asText(enclosure?.['@_type']);
    const url = asText(enclosure?.['@_url']).trim();
    if (url && type.startsWith('image/')) return url;
  }
  return null;
}

/**
 * Turn feed XML into posts, skipping anything malformed rather than failing whole.
 *
 * One bad item should cost one post, not the archive. An item is usable only if
 * it has a link that yields a slug, a title, a date, and a body — those four are
 * what every downstream surface reads.
 */
export function parseFeed(xml: string): FeedPost[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    // Substack wraps titles and bodies in CDATA. Left unset, the parser folds
    // CDATA into the node's text, which is exactly what we want here.
    trimValues: true,
  });

  // The parser returns untyped JSON. Name only the path read here and leave
  // each item's fields `unknown`, so `asText` does the narrowing.
  type RssItem = Record<string, unknown>;
  type RssDoc = { rss?: { channel?: { item?: RssItem | RssItem[] } } };
  const doc = parser.parse(xml) as RssDoc;
  const items = asArray(doc?.rss?.channel?.item);

  const posts: FeedPost[] = [];
  for (const item of items) {
    const link = asText(item?.link);
    const slug = link ? slugFromLink(link) : null;
    const title = asText(item?.title).trim();
    const publishedAt = parseDate(asText(item?.pubDate));
    const bodyHtml = asText(item?.['content:encoded']);

    if (!slug || !title || !publishedAt || !bodyHtml) continue;

    const subtitle = asText(item?.description).trim();

    posts.push({
      slug,
      title,
      subtitle: subtitle || null,
      publishedAt,
      canonicalUrl: link,
      bodyHtml,
      coverImageUrl: coverFromEnclosure(item?.enclosure),
    });
  }

  return posts;
}

/**
 * Substack's JSON API — the authoritative list of every post, not just the
 * newest 20 the RSS carries. RSS stays the source of bodies for recent posts;
 * this is how the site learns a post exists after it has aged out of the feed.
 */
export const API_BASE = 'https://blog.nseldeib.com/api/v1';

/**
 * The largest page the archive endpoint accepts (verified 2026-11-05: 25 is
 * accepted, 30 and above are rejected with "Invalid value"). It paginates with
 * an opaque `nextCursor`, not an offset — `offset` is rejected outright.
 */
export const ARCHIVE_PAGE_SIZE = 25;

/**
 * A ceiling on how many archive pages one reconcile will walk.
 *
 * 20 pages is 500 posts — far beyond this publication — and exists only so a
 * cursor that never ends (an API change, a bug on Substack's side) cannot turn
 * a page render into an unbounded crawl.
 */
export const ARCHIVE_MAX_PAGES = 20;

/** One post as the archive lists it — enough to know it exists, no body. */
export type ArchiveEntry = {
  slug: string;
  /** `everyone` for public posts; anything else must never be mirrored. */
  audience: string;
  publishedAt: Date;
};

export type ArchiveResult = { ok: true; entries: ArchiveEntry[] } | { ok: false; reason: string };

export type PostResult = { ok: true; post: FeedPost } | { ok: false; reason: string };

/** Read one archive page's posts, skipping any entry missing what we rely on. */
export function parseArchive(json: unknown): { entries: ArchiveEntry[]; nextCursor: string | null } {
  const body = (json ?? {}) as { posts?: unknown; nextCursor?: unknown };
  const raw = Array.isArray(body.posts) ? body.posts : [];

  const entries: ArchiveEntry[] = [];
  for (const item of raw as Record<string, unknown>[]) {
    const slug = typeof item?.slug === 'string' ? item.slug : null;
    const audience = typeof item?.audience === 'string' ? item.audience : null;
    const publishedAt = parseDate(item?.post_date);
    if (!slug || !audience || !publishedAt) continue;
    entries.push({ slug, audience, publishedAt });
  }

  const nextCursor = typeof body.nextCursor === 'string' && body.nextCursor ? body.nextCursor : null;
  return { entries, nextCursor };
}

/** Turn the single-post API response into the same shape the feed produces. */
export function parseApiPost(json: unknown): FeedPost | null {
  const item = (json ?? {}) as Record<string, unknown>;
  const slug = typeof item.slug === 'string' ? item.slug : null;
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  const publishedAt = parseDate(item.post_date);
  const bodyHtml = typeof item.body_html === 'string' ? item.body_html : '';
  const canonicalUrl = typeof item.canonical_url === 'string' ? item.canonical_url : '';
  if (!slug || !title || !publishedAt || !bodyHtml || !canonicalUrl) return null;

  const subtitle = typeof item.subtitle === 'string' ? item.subtitle.trim() : '';
  const cover = typeof item.cover_image === 'string' ? item.cover_image.trim() : '';
  return {
    slug,
    title,
    subtitle: subtitle || null,
    publishedAt,
    canonicalUrl,
    bodyHtml,
    coverImageUrl: cover || null,
  };
}

async function getJson(url: string): Promise<{ ok: true; json: unknown } | { ok: false; reason: string }> {
  try {
    const res = await fetch(url, {
      next: { revalidate: FEED_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, reason: `${url} responded ${res.status}` };
    return { ok: true, json: await res.json() };
  } catch (err) {
    return { ok: false, reason: describeError(err, 'unknown fetch failure') };
  }
}

/** The URL of one archive page: the first when `cursor` is null, else the page it names. */
export function archivePageUrl(cursor: string | null): string {
  const base = `${API_BASE}/archive?sort=new&limit=${ARCHIVE_PAGE_SIZE}`;
  return cursor ? `${base}&cursor=${encodeURIComponent(cursor)}` : base;
}

/**
 * Every post Substack lists, newest first, walking the cursor to the end.
 *
 * Never throws. A failure on the FIRST page is a failure; a failure on a later
 * page returns what was gathered so far — a partial list still backfills
 * something, and the next reconcile picks up the rest.
 */
export async function fetchArchiveIndex(): Promise<ArchiveResult> {
  const entries: ArchiveEntry[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < ARCHIVE_MAX_PAGES; page++) {
    const res = await getJson(archivePageUrl(cursor));
    if (!res.ok) {
      return entries.length ? { ok: true, entries } : { ok: false, reason: res.reason };
    }

    const parsed = parseArchive(res.json);
    entries.push(...parsed.entries);
    if (!parsed.nextCursor || !parsed.entries.length) break;
    cursor = parsed.nextCursor;
  }

  if (!entries.length) return { ok: false, reason: 'archive returned no usable posts' };
  return { ok: true, entries };
}

/** One post with its body, by slug — for posts the RSS no longer carries. Never throws. */
export async function fetchPostBySlug(slug: string): Promise<PostResult> {
  const res = await getJson(`${API_BASE}/posts/${encodeURIComponent(slug)}`);
  if (!res.ok) return res;
  const post = parseApiPost(res.json);
  return post ? { ok: true, post } : { ok: false, reason: `post ${slug} missing required fields` };
}

/**
 * Fetch and parse the feed.
 *
 * Never throws. The caller decides what an unreachable Substack means, and for
 * every caller here the answer is "show what is already stored".
 */
export async function fetchFeed(url: string = FEED_URL): Promise<FeedResult> {
  try {
    const res = await fetch(url, {
      // Ignored outside a Next.js request context (a script, a test), which is
      // why nothing downstream depends on it.
      next: { revalidate: FEED_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });

    if (!res.ok) return { ok: false, reason: `feed responded ${res.status}` };

    const xml = await res.text();
    const posts = parseFeed(xml);
    if (!posts.length) return { ok: false, reason: 'feed parsed but contained no usable posts' };

    return { ok: true, posts };
  } catch (err) {
    return { ok: false, reason: describeError(err, 'unknown feed failure') };
  }
}
