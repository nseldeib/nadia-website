import { describe, it, expect } from 'vitest';
import { summarize, toMessageRow, type SeedMessage } from './seedRows';

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
