import { describe, expect, it, vi } from 'vitest';
import type { Metadata } from 'next';

// The writing pages read posts from the database; their metadata is what is
// under test here, so the post store is replaced with a fixed post.
const getPost = vi.hoisted(() => vi.fn());
vi.mock('@/app/lib/posts', () => ({
  getPost,
  adjacentPosts: vi.fn(),
  listPosts: vi.fn(),
  reconcileWithinDeadline: vi.fn(),
}));

const { SHARE_IMAGE, postShareImage } = await import('./shareImage');

const RACE_COVER =
  'https://substackcdn.com/image/fetch/$s_!As2W!,f_auto,q_auto:good,fl_progressive:steep/' +
  'https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7bb51aee_5712x4284.jpeg';
const { metadata: rootMetadata } = await import('@/app/layout');
const { metadata: writingMetadata } = await import('@/app/writing/page');
const { generateMetadata: postMetadata } = await import('@/app/writing/[slug]/page');

function ogImages(metadata: Metadata) {
  return (metadata.openGraph as { images?: unknown } | undefined)?.images;
}

describe('SHARE_IMAGE', () => {
  // LinkedIn, X and Slack render a large card only for a 1200 by 630 image.
  it('is sized for a large link preview card', () => {
    expect(SHARE_IMAGE.width).toBe(1200);
    expect(SHARE_IMAGE.height).toBe(630);
  });

  // The file is served from public/, so the URL must be root-relative for
  // metadataBase to make it absolute.
  it('points at the served JPEG under public images', () => {
    expect(SHARE_IMAGE.url).toBe('/images/share-summit.jpg');
    expect(SHARE_IMAGE.type).toBe('image/jpeg');
  });

  // Screen readers and broken-image fallbacks read the alt text.
  it('carries descriptive alt text', () => {
    expect(SHARE_IMAGE.alt.trim().length).toBeGreaterThan(20);
  });
});

describe('postShareImage', () => {
  const post = { title: 'Racetoberfest Reflection', coverImageUrl: RACE_COVER };

  // A post card shows that post, not the site: its Substack cover, cropped by
  // Substack's image CDN to the large-card size.
  it('crops a Substack cover to 1200 by 630', () => {
    const image = postShareImage(post);
    expect(image.url).toBe(
      'https://substackcdn.com/image/fetch/$s_!As2W!,w_1200,h_630,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/' +
        'https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7bb51aee_5712x4284.jpeg',
    );
    expect(image).toMatchObject({ width: 1200, height: 630, type: 'image/jpeg' });
  });

  // The cover has no alt text of its own; the post title says what it is for.
  it('describes the cover with the post title', () => {
    expect(postShareImage(post).alt).toBe('Cover image for Racetoberfest Reflection');
  });

  // A cover hosted somewhere other than Substack's CDN cannot be cropped, so
  // it is used as-is and no size is claimed for it.
  it('uses any other https cover unchanged without a size', () => {
    const image = postShareImage({ ...post, coverImageUrl: 'https://example.com/c.jpg' });
    expect(image.url).toBe('https://example.com/c.jpg');
    expect(image).not.toHaveProperty('width');
  });

  // A post without a usable cover still gets a picture: the site one.
  it('falls back to the site image when there is no usable cover', () => {
    expect(postShareImage({ ...post, coverImageUrl: null })).toEqual(SHARE_IMAGE);
    expect(postShareImage({ ...post, coverImageUrl: '' })).toEqual(SHARE_IMAGE);
    expect(postShareImage({ ...post, coverImageUrl: 'http://example.com/c.jpg' })).toEqual(SHARE_IMAGE);
    expect(postShareImage({ ...post, coverImageUrl: 'javascript:alert(1)' })).toEqual(SHARE_IMAGE);
  });
});

describe('share image on every page', () => {
  // The homepage inherits the root layout openGraph.
  it('is set on the root layout openGraph', () => {
    expect(ogImages(rootMetadata)).toEqual([SHARE_IMAGE]);
  });

  // X shows the large image card only when the card type asks for it.
  it('asks X for the large image card', () => {
    expect(rootMetadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  // The archive sets its own openGraph, which replaces the parent one, so it
  // must carry the image itself.
  it('is kept on the writing archive openGraph', () => {
    expect(ogImages(writingMetadata)).toEqual([SHARE_IMAGE]);
  });

  const storedPost = {
    slug: 'a-post',
    title: 'A post',
    subtitle: 'About things',
    bodyHtml: '<p>Hello</p>',
    publishedAt: new Date('2026-01-02T00:00:00Z'),
    coverImageUrl: null as string | null,
  };

  // A post with a cover shares that cover, not the site photo.
  it('is the post cover on a writing post that has one', async () => {
    getPost.mockResolvedValue({ ...storedPost, coverImageUrl: RACE_COVER });

    const metadata = await postMetadata({ params: Promise.resolve({ slug: 'a-post' }) });

    expect(ogImages(metadata)).toEqual([postShareImage({ title: 'A post', coverImageUrl: RACE_COVER })]);
  });

  // Each post sets its own openGraph for its title and URL, so one without a
  // cover must carry the site image itself.
  it('is kept on a writing post without a cover', async () => {
    getPost.mockResolvedValue(storedPost);

    const metadata = await postMetadata({ params: Promise.resolve({ slug: 'a-post' }) });

    expect(ogImages(metadata)).toEqual([SHARE_IMAGE]);
  });
});
