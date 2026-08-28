import { describe, expect, it } from 'vitest';
import { SITE_URL, siteUrl } from './siteUrl';

describe('SITE_URL', () => {
  // Pins the canonical origin's exact shape. Three consumers concatenate onto
  // it — document metadata, robots.txt, sitemap.xml — so a trailing slash here
  // silently becomes "//sitemap.xml" in the advertised sitemap link.
  it('is the bare apex over https, with no trailing slash', () => {
    expect(SITE_URL).toBe('https://nadiaeldeib.com');
  });

  // Guards against canonicalising a host that only redirects. www.nadiaeldeib.com
  // and both forms of nseldeib.com 301 to the apex; naming any of them here would
  // point every crawler and share link at a redirect instead of the real page.
  it('names the apex rather than a redirecting host', () => {
    expect(SITE_URL).not.toMatch(/^https:\/\/www\./);
    expect(SITE_URL).not.toContain('nseldeib');
  });
});

describe('siteUrl', () => {
  // The site root must render as the bare origin, with no trailing slash, whether
  // it is requested by default or explicitly as '/'. This is the value that lands
  // in the sitemap's <loc> and in og:url.
  it('returns the bare origin for the site root', () => {
    expect(siteUrl()).toBe('https://nadiaeldeib.com');
    expect(siteUrl('/')).toBe('https://nadiaeldeib.com');
  });

  // The ordinary case: a root-relative path appends cleanly. Since SITE_URL has no
  // trailing slash and the path carries a leading one, naive concatenation is
  // already correct here — this locks that in.
  it('joins a root-relative path without doubling the slash', () => {
    expect(siteUrl('/sitemap.xml')).toBe('https://nadiaeldeib.com/sitemap.xml');
  });

  // A caller that omits the leading slash must not produce "nadiaeldeib.comsitemap.xml".
  // This is the case naive concatenation gets wrong, so it is the reason the helper
  // exists at all rather than a template literal at each call site.
  it('tolerates a path given without its leading slash', () => {
    expect(siteUrl('sitemap.xml')).toBe('https://nadiaeldeib.com/sitemap.xml');
  });

  // Sweeps the boundary inputs at once — root, empty, bare, rooted, and nested — to
  // assert the invariant that no combination emits "//" after the origin. A doubled
  // slash yields a URL that resolves but is treated as a distinct address by crawlers.
  it('never emits a doubled slash after the origin', () => {
    for (const path of ['/', '', 'a', '/a', '/a/b']) {
      expect(siteUrl(path)).not.toMatch(/nadiaeldeib\.com\/\//);
    }
  });
});
