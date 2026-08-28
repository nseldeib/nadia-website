/**
 * The one canonical origin for this site.
 *
 * Four hostnames reach the app — nadiaeldeib.com, www.nadiaeldeib.com, and
 * both forms of nseldeib.com — but only this one is advertised. The other
 * three 301 here at the edge, so every crawler and every share link
 * collapses onto a single address.
 *
 * Stated once because three separate consumers need it in agreement: the
 * document metadata, robots.txt, and the sitemap. A domain that drifts
 * between them is the failure this constant exists to prevent.
 */
export const SITE_URL = 'https://nadiaeldeib.com';

/** `SITE_URL` joined to a root-relative path, without a doubled slash. */
export function siteUrl(path = '/'): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
