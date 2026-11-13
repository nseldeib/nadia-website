import { readFileSync } from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import site from '../content/site';
import { seedTable, summarize, toMessageRow, toSeedPostRow, type SeedMessage, type SeedPost } from './seedRows';

const essay: SeedPost = {
  slug: 'running-towards-and-past-35',
  title: 'Running Towards (and Past) 35!',
  publishedAt: '2026-05-01T12:00:00.000Z',
  canonicalUrl: 'https://example.substack.com/p/running-towards-and-past-35',
  bodyHtml: '<p>Body</p>',
};

describe('seedTable', () => {
  // The ordinary case: the named table's rows come back as-is.
  it('returns the rows of the named table', () => {
    expect(seedTable({ seed: { Post: [essay] } }, 'Post')).toEqual([essay]);
  });

  // A file that seeds other tables only is valid and seeds nothing here.
  it('returns an empty list when the table is absent', () => {
    expect(seedTable({ seed: { Message: [] } }, 'Post')).toEqual([]);
  });

  // A malformed file must not crash the seed or hand Prisma a non-array.
  it('returns an empty list for a malformed shape', () => {
    expect(seedTable(null, 'Post')).toEqual([]);
    expect(seedTable({}, 'Post')).toEqual([]);
    expect(seedTable({ seed: { Post: 'oops' } }, 'Post')).toEqual([]);
  });
});

describe('toSeedPostRow', () => {
  // Prisma wants a Date, the seed file carries an ISO string.
  it('converts publishedAt to a Date', () => {
    expect(toSeedPostRow(essay).publishedAt).toEqual(new Date('2026-05-01T12:00:00.000Z'));
  });

  // subtitle is nullable; an absent one must be an explicit null in the row.
  it('normalises a missing subtitle to null', () => {
    expect(toSeedPostRow(essay).subtitle).toBeNull();
    expect(toSeedPostRow({ ...essay, subtitle: 'A sub' }).subtitle).toBe('A sub');
  });

  // updatedAt is left to Prisma so the far-future capture value never reaches
  // a developer's database.
  it('does not carry updatedAt into the row', () => {
    const row = toSeedPostRow({ ...essay, updatedAt: '2099-01-01T00:00:00.000Z' } as SeedPost);
    expect(row).not.toHaveProperty('updatedAt');
  });
});

describe('running-essays seed file', () => {
  // Every Adventures link must have a seeded essay, or it 404s in the preview
  // and in a freshly seeded local database.
  it('holds a post for every slug the Adventures section links to', () => {
    const raw = JSON.parse(
      readFileSync(path.join(__dirname, '..', '.codeyam', 'seed-data', 'running-essays.json'), 'utf8'),
    );
    const seeded = new Set(seedTable<SeedPost>(raw, 'Post').map((p) => p.slug));
    const linked = (site.adventures.reading?.links ?? []).map((l) => l.slug.trim());
    expect(linked.length).toBeGreaterThan(0);
    expect(linked.filter((slug) => !seeded.has(slug))).toEqual([]);
  });
});

const base: SeedMessage = {
  topic: 'hello',
  name: 'Ada',
  email: 'ada@example.com',
  body: 'Saying hello.',
};

describe('toMessageRow', () => {
  // The two absences mean different things and must not be collapsed:
  // `createdAt` undefined lets the column default apply, while `emailedAt`
  // null is a deliberate value meaning "arrived but never delivered".
  it('distinguishes an absent createdAt from an absent emailedAt', () => {
    const row = toMessageRow(base);
    expect(row.createdAt).toBeUndefined();
    expect(row.emailedAt).toBeNull();
  });

  // The seed file carries ISO strings but Prisma wants Date objects; handing
  // it a string is the mistake this pins.
  it('converts both timestamps when present', () => {
    const row = toMessageRow({
      ...base,
      createdAt: '2026-08-18T11:33:02.000Z',
      emailedAt: '2026-08-18T11:34:00.000Z',
    });
    expect(row.createdAt).toEqual(new Date('2026-08-18T11:33:02.000Z'));
    expect(row.emailedAt).toEqual(new Date('2026-08-18T11:34:00.000Z'));
  });

  // An explicit null in the seed file is the undelivered state the fixture
  // exists to represent, and must survive as null rather than becoming a date.
  it('keeps an explicit null emailedAt', () => {
    expect(toMessageRow({ ...base, emailedAt: null }).emailedAt).toBeNull();
  });

  // sourcePage is nullable in the schema; undefined in the fixture must become
  // an explicit null rather than being dropped from the insert.
  it('normalises a missing sourcePage to null', () => {
    expect(toMessageRow(base).sourcePage).toBeNull();
    expect(toMessageRow({ ...base, sourcePage: '/work' }).sourcePage).toBe('/work');
  });
});

describe('summarize', () => {
  // The delivered count is what makes the seeded undelivered row visible in
  // the output — the state is easy to seed and easy to forget is there.
  it('counts delivered and undelivered separately', () => {
    expect(
      summarize([
        { ...base, emailedAt: '2026-08-18T11:33:02.000Z' },
        { ...base, emailedAt: null },
        { ...base },
      ]),
    ).toBe('Seeded 3 message(s): 1 delivered, 2 saved but not emailed.');
  });

  // A clone with no seed file is a valid state, so the summary has to read as
  // a sentence rather than dividing by zero or printing NaN.
  it('reads correctly for an empty set', () => {
    expect(summarize([])).toBe('Seeded 0 message(s): 0 delivered, 0 saved but not emailed.');
  });
});
