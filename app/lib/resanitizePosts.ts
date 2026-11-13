// Pure helpers behind `npm run posts:resanitize` (scripts/resanitize-posts.ts).
//
// Post bodies are sanitized on the way in, so a sanitizer fix only reaches
// posts written after it. These decide which stored bodies the CURRENT
// sanitizer would change, and word the report — no database access here.

import { sanitizePostHtml } from './sanitizePostHtml';

export type StoredPostBody = { id: number; slug: string; bodyHtml: string };

/**
 * Returns the posts whose stored body differs from what the current sanitizer
 * produces, each carrying its cleaned body. Posts already clean are left out,
 * so a second run over the result returns nothing.
 */
export function postsNeedingResanitize(posts: StoredPostBody[]): StoredPostBody[] {
  const changed: StoredPostBody[] = [];
  for (const post of posts) {
    const cleaned = sanitizePostHtml(post.bodyHtml);
    if (cleaned !== post.bodyHtml) changed.push({ ...post, bodyHtml: cleaned });
  }
  return changed;
}

/**
 * The lines the script prints: one per changed slug, then a summary. A dry run
 * says "would re-sanitize" so its output cannot be mistaken for a real write.
 */
export function resanitizeReport(changedSlugs: string[], total: number, dryRun: boolean): string[] {
  const verb = dryRun ? 'would re-sanitize' : 're-sanitized';
  return [
    ...changedSlugs.map((slug) => `${verb}: ${slug}`),
    `Checked ${total} post(s); ${verb} ${changedSlugs.length}.`,
  ];
}
