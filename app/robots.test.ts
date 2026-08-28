import { describe, expect, it } from 'vitest';
import robots from './robots';
import { siteUrl } from './lib/siteUrl';

describe('robots', () => {
  // The site is a public personal page with nothing to hide, so the rule must stay
  // fully open. A stray Disallow here would quietly de-index the whole site, which
  // is the single highest-cost mistake this file can make.
  it('lets every crawler read the whole site', () => {
    const { rules } = robots();
    expect(rules).toEqual({ userAgent: '*', allow: '/' });
  });

  // The sitemap must be advertised on the canonical host. Pointing at a redirecting
  // hostname costs a hop on every crawler fetch and muddies which domain owns the
  // content — the exact ambiguity this cycle's redirects exist to remove.
  it('points at the sitemap on the canonical host', () => {
    expect(robots().sitemap).toBe(siteUrl('/sitemap.xml'));
  });

  // The editor's isolation routes already 404 in production. Naming them in a
  // Disallow would publish a list of paths that do not exist — robots.txt is public,
  // so a Disallow advertises a path rather than hiding it.
  it('disallows nothing, so it cannot advertise the isolation routes', () => {
    const serialized = JSON.stringify(robots());
    expect(serialized).not.toContain('disallow');
    expect(serialized).not.toContain('isolated-components');
    expect(serialized).not.toContain('scenario');
  });
});
