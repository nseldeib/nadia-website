import type { MetadataRoute } from 'next';
import { siteUrl } from './lib/siteUrl';

/**
 * One entry, because the site is one page.
 *
 * The six numbered sections are anchors within `/`, not routes, so listing
 * them would offer crawlers URLs that resolve to the same document. If the
 * site ever grows a real second route, it belongs here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl(),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
