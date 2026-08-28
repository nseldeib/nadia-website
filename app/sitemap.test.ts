import { describe, expect, it } from 'vitest';
import sitemap from './sitemap';
import { SITE_URL } from './lib/siteUrl';

describe('sitemap', () => {
  // The site is one page. Its six numbered sections are anchors within '/', not
  // routes, so listing them would hand crawlers several URLs that all resolve to the
  // same document. This fails loudly if someone adds anchors as if they were pages.
  it('lists the single page the site actually has', () => {
    const entries = sitemap();
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe(SITE_URL);
  });

  // With exactly one page, that page is by definition the most important one on the
  // site, so priority must be the maximum.
  it('gives the only page top priority', () => {
    expect(sitemap()[0].priority).toBe(1);
  });

  // lastModified must be a real Date, not a string or an Invalid Date. Next serialises
  // it into <lastmod>, and a malformed value there makes crawlers discard the freshness
  // signal for the entry entirely.
  it('stamps a real lastModified date', () => {
    const { lastModified } = sitemap()[0];
    expect(lastModified).toBeInstanceOf(Date);
    expect(Number.isNaN(new Date(lastModified as Date).getTime())).toBe(false);
  });

  // Every <loc> must name the canonical apex. A sitemap listing www. or nseldeib.com
  // would submit redirecting URLs for indexing, splitting the site's identity across
  // hosts — the precise outcome the redirects in this cycle are meant to prevent.
  it('advertises no host that only redirects', () => {
    for (const { url } of sitemap()) {
      expect(url).not.toContain('www.');
      expect(url).not.toContain('nseldeib');
    }
  });
});
