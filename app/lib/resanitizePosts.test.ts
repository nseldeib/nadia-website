import { describe, it, expect } from 'vitest';
import { postsNeedingResanitize, resanitizeReport } from './resanitizePosts';
import { sanitizePostHtml } from './sanitizePostHtml';

// Markup stored before the external-link fix: the link has no target/rel.
const OLD_EXTERNAL = '<p>See <a href="https://example.com">this</a>.</p>';

describe('postsNeedingResanitize', () => {
  // The bug this exists for: an old external link gains target and rel.
  it('returns a post with an old external link, carrying the cleaned body', () => {
    const [post] = postsNeedingResanitize([{ id: 1, slug: 'old', bodyHtml: OLD_EXTERNAL }]);

    expect(post.id).toBe(1);
    expect(post.slug).toBe('old');
    expect(post.bodyHtml).toContain('target="_blank"');
    expect(post.bodyHtml).toContain('rel="noopener noreferrer"');
  });

  // Rows the sanitizer would not change must not be rewritten.
  it('leaves out posts that are already clean', () => {
    const clean = sanitizePostHtml(OLD_EXTERNAL);
    expect(postsNeedingResanitize([{ id: 2, slug: 'clean', bodyHtml: clean }])).toEqual([]);
  });

  // Internal and mailto links are not external, so they stay as stored.
  it('leaves out posts whose only links are not external', () => {
    const html = '<p><a href="mailto:a@b.c">mail</a></p>';
    expect(postsNeedingResanitize([{ id: 3, slug: 'mail', bodyHtml: html }])).toEqual([]);
  });

  // Running the script twice must change nothing the second time.
  it('is idempotent: a second pass over its own output returns nothing', () => {
    const first = postsNeedingResanitize([{ id: 1, slug: 'old', bodyHtml: OLD_EXTERNAL }]);
    expect(postsNeedingResanitize(first)).toEqual([]);
  });

  // Only the changed rows come back, in their original order.
  it('picks out just the stale posts from a mixed set', () => {
    const clean = sanitizePostHtml(OLD_EXTERNAL);
    const out = postsNeedingResanitize([
      { id: 1, slug: 'a', bodyHtml: OLD_EXTERNAL },
      { id: 2, slug: 'b', bodyHtml: clean },
      { id: 3, slug: 'c', bodyHtml: '<p>x</p><script>bad()</script>' },
    ]);
    expect(out.map((p) => p.slug)).toEqual(['a', 'c']);
  });

  // An empty table is a valid input, not an error.
  it('returns nothing for no posts', () => {
    expect(postsNeedingResanitize([])).toEqual([]);
  });
});

describe('resanitizeReport', () => {
  // A real run names each rewritten slug and totals them.
  it('lists each changed slug and a summary for a real run', () => {
    expect(resanitizeReport(['a', 'b'], 5, false)).toEqual([
      're-sanitized: a',
      're-sanitized: b',
      'Checked 5 post(s); re-sanitized 2.',
    ]);
  });

  // A dry run must not read as if it wrote anything.
  it('says would re-sanitize on a dry run', () => {
    expect(resanitizeReport(['a'], 3, true)).toEqual([
      'would re-sanitize: a',
      'Checked 3 post(s); would re-sanitize 1.',
    ]);
  });

  // Nothing to do still prints the summary line.
  it('prints only the summary when nothing changed', () => {
    expect(resanitizeReport([], 4, false)).toEqual(['Checked 4 post(s); re-sanitized 0.']);
  });
});
