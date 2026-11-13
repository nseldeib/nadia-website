import { describe, it, expect, vi, beforeEach } from 'vitest';

// The page's data path, with the store mocked. findPost is private, so it is
// exercised through generateMetadata — the same lookup the page itself uses.
const getPost = vi.fn();
const reconcileWithinDeadline = vi.fn();
const adjacentPosts = vi.fn();

vi.mock('@/app/lib/posts', () => ({
  getPost: (...a: unknown[]) => getPost(...a),
  reconcileWithinDeadline: (...a: unknown[]) => reconcileWithinDeadline(...a),
  adjacentPosts: (...a: unknown[]) => adjacentPosts(...a),
}));

const { generateMetadata } = await import('./page');

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

const stored = {
  slug: 'a-post',
  title: 'A post',
  subtitle: 'The subtitle',
  bodyHtml: '<p>The opening paragraph.</p>',
  publishedAt: new Date('2026-07-06T12:00:00Z'),
  canonicalUrl: 'https://blog.nseldeib.com/p/a-post',
};

beforeEach(() => {
  vi.resetAllMocks();
  reconcileWithinDeadline.mockResolvedValue({ timedOut: true });
});

describe('findPost via generateMetadata', () => {
  // The common case is already stored and must cost one query, no feed.
  it('does not reconcile when the slug is already stored', async () => {
    getPost.mockResolvedValue(stored);

    await generateMetadata(params('a-post'));

    expect(getPost).toHaveBeenCalledOnce();
    expect(reconcileWithinDeadline).not.toHaveBeenCalled();
  });

  // A link to a post published since the site last looked.
  it('reconciles once and looks again for an unknown slug', async () => {
    getPost.mockResolvedValueOnce(null).mockResolvedValueOnce(stored);

    const meta = await generateMetadata(params('a-post'));

    expect(reconcileWithinDeadline).toHaveBeenCalledOnce();
    expect(getPost).toHaveBeenCalledTimes(2);
    expect(meta.title).toBe('A post · Nadia Eldeib');
  });
});

describe('generateMetadata', () => {
  // An unknown slug gets a not-found title.
  it('titles a missing post as not found', async () => {
    getPost.mockResolvedValue(null);
    expect(await generateMetadata(params('nope'))).toEqual({ title: 'Page not found · Nadia Eldeib' });
  });

  // Post pages canonicalise to this site, not Substack.
  it('is self-canonical on this domain and uses the subtitle as description', async () => {
    getPost.mockResolvedValue(stored);

    const meta = await generateMetadata(params('a-post'));

    expect(meta.description).toBe('The subtitle');
    expect(meta.alternates?.canonical).toBe('https://nadiaeldeib.com/writing/a-post');
    expect(meta.openGraph).toMatchObject({
      type: 'article',
      url: 'https://nadiaeldeib.com/writing/a-post',
      publishedTime: '2026-07-06T12:00:00.000Z',
    });
  });

  // A blank subtitle falls back to the body's opening.
  it('falls back to an excerpt of the body when there is no subtitle', async () => {
    getPost.mockResolvedValue({ ...stored, subtitle: '  ' });
    expect((await generateMetadata(params('a-post'))).description).toBe('The opening paragraph.');
  });
});
