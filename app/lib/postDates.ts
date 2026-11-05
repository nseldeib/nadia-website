// How dates read on the writing pages, and how the archive is grouped.
//
// Everything here formats in UTC on purpose. `publishedAt` comes from the
// feed's RFC-822 timestamps, and a post published late in the evening New York
// time would otherwise render as the next day on a machine set to UTC — which
// would make scenario screenshots differ between the developer's laptop and
// CI for reasons that have nothing to do with the change under review.

import type { PostSummary } from './posts';

/** `Jul 13` — the short form the homepage list already uses. */
export function formatPostDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** `13 July 2026` — the long form a post page can afford to spell out. */
export function formatPostDateLong(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** The year a post belongs to, in the same timezone everything else uses. */
export function postYear(date: Date): number {
  return date.getUTCFullYear();
}

export type PostYearGroup<T> = { year: number; posts: T[] };

/**
 * Split posts into year runs, preserving the order they arrive in.
 *
 * The caller has already sorted (newest first), so this must not re-sort — it
 * only cuts the list where the year changes. Grouping by a map and reading the
 * keys back would silently depend on insertion order; walking the list keeps
 * the archive in exactly the order it was queried in.
 */
export function groupPostsByYear<T extends { publishedAt: Date }>(
  posts: T[],
): PostYearGroup<T>[] {
  const groups: PostYearGroup<T>[] = [];

  for (const post of posts) {
    const year = postYear(post.publishedAt);
    const current = groups[groups.length - 1];
    if (current && current.year === year) {
      current.posts.push(post);
    } else {
      groups.push({ year, posts: [post] });
    }
  }

  return groups;
}

export type { PostSummary };
