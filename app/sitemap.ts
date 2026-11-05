import type { MetadataRoute } from 'next';
import { siteUrl } from './lib/siteUrl';
import { listPosts } from './lib/posts';

/**
 * The homepage, the writing archive, and every post that has been seen.
 *
 * This used to return a single entry, with a comment saying the six numbered
 * sections are anchors within `/` rather than routes — that reasoning still
 * holds and they are still absent. What changed is that the site grew the real
 * second route the old comment anticipated, plus one route per essay.
 *
 * Posts come from the store rather than the feed on purpose. The store is the
 * set of URLs this site will actually serve, including posts that have aged
 * out of Substack's 20-item window; the feed is neither a subset nor a
 * superset of that, and listing a URL the site cannot serve is worse than
 * omitting one it can.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed: MetadataRoute.Sitemap = [
    {
      url: siteUrl(),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: siteUrl('/writing'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // A database that cannot be reached must not produce a 500 where a crawler
  // expects XML. Serving the two routes that are always true is a strictly
  // better failure than serving nothing.
  let posts: Awaited<ReturnType<typeof listPosts>> = [];
  try {
    posts = await listPosts();
  } catch {
    return fixed;
  }

  return [
    ...fixed,
    ...posts.map((post) => ({
      url: siteUrl(`/writing/${post.slug}`),
      lastModified: post.publishedAt,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
