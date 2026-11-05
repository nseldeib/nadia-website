import { describe, expect, it, vi } from 'vitest';
import { SITE_URL } from './lib/siteUrl';

// The sitemap reads the post store, so the store is mocked rather than
// connected to. Without this the assertions below would depend on whichever
// posts happen to be in the developer's database, and the suite would pass or
// fail for reasons that have nothing to do with the sitemap.
const listPosts = vi.hoisted(() => vi.fn());
vi.mock('./lib/posts', () => ({ listPosts }));

const { default: sitemap } = await import('./sitemap');

function post(slug: string, iso: string) {
  return {
    slug,
    title: slug,
    subtitle: null,
    publishedAt: new Date(iso),
    canonicalUrl: `https://blog.nseldeib.com/p/${slug}`,
  };
}

describe('sitemap', () => {
  // The site's six numbered sections are anchors within '/', not routes, so
  // listing them would hand crawlers several URLs resolving to one document.
  // The routes that DO belong here are the homepage, the archive, and one per
  // essay. This fails loudly if someone adds anchors as if they were pages.
  it('lists the homepage, the archive, and one entry per post', async () => {
    listPosts.mockResolvedValue([
      post('you-can-just-ship-things', '2026-07-06T20:56:20Z'),
      post('our-vision-for-codeyam-why-build', '2024-07-24T20:48:45Z'),
    ]);

    const entries = await sitemap();

    expect(entries.map((e) => e.url)).toEqual([
      SITE_URL,
      `${SITE_URL}/writing`,
      `${SITE_URL}/writing/you-can-just-ship-things`,
      `${SITE_URL}/writing/our-vision-for-codeyam-why-build`,
    ]);
  });

  // The homepage remains the site's front door and must outrank the archive
  // and the individual essays.
  it('gives the homepage top priority', async () => {
    listPosts.mockResolvedValue([]);
    const entries = await sitemap();

    expect(entries[0].priority).toBe(1);
    expect(entries[1].priority).toBeLessThan(1);
  });

  // Next serialises lastModified into <lastmod>; a malformed value makes
  // crawlers discard the freshness signal for that entry entirely. A post's
  // date must be its own publication date, not the time the file was rendered.
  it('stamps every entry with a real date, dating posts by publication', async () => {
    const published = new Date('2026-07-06T20:56:20Z');
    listPosts.mockResolvedValue([post('you-can-just-ship-things', published.toISOString())]);

    const entries = await sitemap();

    for (const { lastModified } of entries) {
      expect(lastModified).toBeInstanceOf(Date);
      expect(Number.isNaN(new Date(lastModified as Date).getTime())).toBe(false);
    }
    expect(entries[2].lastModified).toEqual(published);
  });

  // A crawler asking for XML must not get a 500 because Postgres is briefly
  // unreachable. The two routes that are always true are a strictly better
  // answer than no answer.
  it('still serves the fixed routes when the store cannot be read', async () => {
    listPosts.mockRejectedValue(new Error('connection refused'));

    const entries = await sitemap();

    expect(entries.map((e) => e.url)).toEqual([SITE_URL, `${SITE_URL}/writing`]);
  });

  // Every <loc> must name the canonical apex. A sitemap listing www. or
  // nseldeib.com would submit redirecting URLs for indexing, splitting the
  // site's identity across hosts — the outcome the edge redirects prevent.
  it('advertises no host that only redirects', async () => {
    listPosts.mockResolvedValue([post('you-can-just-ship-things', '2026-07-06T20:56:20Z')]);

    for (const { url } of await sitemap()) {
      expect(url).not.toContain('www.');
      expect(url).not.toContain('nseldeib.com');
    }
  });
});
