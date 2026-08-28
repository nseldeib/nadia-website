import type { MetadataRoute } from 'next';
import { siteUrl } from './lib/siteUrl';

/**
 * Crawl the whole site, and say where the sitemap is.
 *
 * Nothing is disallowed on purpose. The editor's isolation routes
 * (/isolated-components/*, /scenario/*) already 404 in production, and
 * naming them here would only advertise paths that do not exist.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: siteUrl('/sitemap.xml'),
    host: siteUrl(),
  };
}
