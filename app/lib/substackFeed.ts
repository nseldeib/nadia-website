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

  const doc = parser.parse(xml) as Record<string, any>;
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
    });
  }

  return posts;
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
    return { ok: false, reason: err instanceof Error ? err.message : 'unknown feed failure' };
  }
}
