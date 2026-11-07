import { describe, expect, it } from 'vitest';
import { toReadingLinks } from './readingLinks';

describe('toReadingLinks', () => {
  // The ordinary case: a slug becomes an internal /writing/ path and the title
  // becomes the visible label, so the essay opens on this site.
  it('maps a slug to an internal writing path and keeps the title as label', () => {
    expect(toReadingLinks([{ slug: 'running-towards-and-past-35', title: 'Running Towards and Past 35' }])).toEqual([
      { href: '/writing/running-towards-and-past-35', label: 'Running Towards and Past 35' },
    ]);
  });

  // The authored order is the order the reader sees, so it must survive.
  it('preserves the authored order of several entries', () => {
    const out = toReadingLinks([
      { slug: 'b', title: 'B' },
      { slug: 'a', title: 'A' },
      { slug: 'c', title: 'C' },
    ]);
    expect(out.map((l) => l.href)).toEqual(['/writing/b', '/writing/a', '/writing/c']);
  });

  // An empty list renders nothing upstream; the transform must not invent entries.
  it('returns an empty list for no entries', () => {
    expect(toReadingLinks([])).toEqual([]);
  });

  // Stray whitespace from hand-edited JSON must not leak into the URL as %20.
  it('trims whitespace around a slug', () => {
    expect(toReadingLinks([{ slug: '  on-stubbornness  ', title: 'x' }])[0].href).toBe('/writing/on-stubbornness');
  });

  // A slug with a reserved character is escaped so it stays one path segment
  // instead of breaking out into a query string or a second segment.
  it('escapes reserved characters so the slug stays a single path segment', () => {
    expect(toReadingLinks([{ slug: 'a/b?c', title: 'x' }])[0].href).toBe('/writing/a%2Fb%3Fc');
  });

  // The href is always root-relative, never an external Substack URL — the
  // link list treats these as same-tab internal links.
  it('never produces an external URL', () => {
    const [link] = toReadingLinks([{ slug: 'the-magic-of-attempting-hard-things', title: 'x' }]);
    expect(link.href.startsWith('/writing/')).toBe(true);
    expect(link.href).not.toContain('://');
  });
});
