import { describe, it, expect } from 'vitest';
import { formatPostDate, formatPostDateLong, groupPostsByYear, postYear } from './postDates';

// 23:30 New York on 31 Dec 2025 is already 1 Jan 2026 in UTC. Every helper
// here formats in UTC on purpose, so this instant must read as the UTC date
// regardless of the machine's timezone.
const NEW_YEARS_EDGE = new Date('2026-01-01T04:30:00Z');

describe('formatPostDate', () => {
  // The homepage and archive date column use this short form.
  it('renders the short month-day form', () => {
    expect(formatPostDate(new Date('2026-07-13T12:00:00Z'))).toBe('Jul 13');
  });

  // A late-evening New York post must not render as the next day on a UTC machine.
  it('formats in UTC, not the local timezone', () => {
    expect(formatPostDate(NEW_YEARS_EDGE)).toBe('Jan 1');
  });
});

describe('formatPostDateLong', () => {
  // The post page header uses the long form.
  it('spells out day, month and year', () => {
    expect(formatPostDateLong(new Date('2026-07-13T12:00:00Z'))).toBe('13 July 2026');
  });

  // A late-evening New York post must not render as the next day on a UTC machine.
  it('formats in UTC, not the local timezone', () => {
    expect(formatPostDateLong(NEW_YEARS_EDGE)).toBe('1 January 2026');
  });
});

describe('postYear', () => {
  // The year cut in the archive uses the same timezone as every date label.
  it('reads the UTC year', () => {
    expect(postYear(NEW_YEARS_EDGE)).toBe(2026);
  });
});

describe('groupPostsByYear', () => {
  const post = (slug: string, iso: string) => ({ slug, publishedAt: new Date(iso) });

  // An empty archive renders no year sections at all.
  it('returns no groups for no posts', () => {
    expect(groupPostsByYear([])).toEqual([]);
  });

  // Each run of same-year posts becomes one group, in the order given.
  it('cuts a newest-first list where the year changes', () => {
    const groups = groupPostsByYear([
      post('c', '2026-03-01T00:00:00Z'),
      post('b', '2026-01-05T00:00:00Z'),
      post('a', '2024-11-20T00:00:00Z'),
    ]);

    expect(groups.map((g) => g.year)).toEqual([2026, 2024]);
    expect(groups.map((g) => g.posts.map((p) => p.slug))).toEqual([['c', 'b'], ['a']]);
  });

  // It must not re-sort: the caller's order is the archive's order.
  it('preserves the order it was given', () => {
    const groups = groupPostsByYear([
      post('old', '2024-01-01T00:00:00Z'),
      post('new', '2026-01-01T00:00:00Z'),
    ]);

    expect(groups.map((g) => g.year)).toEqual([2024, 2026]);
  });
});
