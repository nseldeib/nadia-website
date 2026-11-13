import { describe, it, expect } from 'vitest';
import { inBatches } from './inBatches';

/** Records how many calls overlap, so the concurrency ceiling can be asserted. */
function tracker() {
  let inFlight = 0;
  let peak = 0;
  const seen: number[] = [];
  const fn = async (n: number) => {
    inFlight++;
    peak = Math.max(peak, inFlight);
    await new Promise((r) => setTimeout(r, 1));
    seen.push(n);
    inFlight--;
  };
  return { fn, seen, peak: () => peak };
}

describe('inBatches', () => {
  // Every item must be processed — a dropped post is exactly the bug this
  // feature exists to fix.
  it('calls fn once for every item', async () => {
    const t = tracker();
    await inBatches([1, 2, 3, 4, 5, 6, 7], 3, t.fn);
    expect([...t.seen].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  // The ceiling is what keeps a reconcile from exhausting the small
  // connection pool.
  it('never has more than size calls in flight', async () => {
    const t = tracker();
    await inBatches(Array.from({ length: 12 }, (_, i) => i), 5, t.fn);
    expect(t.peak()).toBe(5);
  });

  // An empty list is the common case once the store is complete and must not
  // call anything.
  it('does nothing for an empty list', async () => {
    const t = tracker();
    await inBatches([], 5, t.fn);
    expect(t.seen).toEqual([]);
  });

  // A size of zero would loop forever without the floor of one.
  it('treats a size below one as one', async () => {
    const t = tracker();
    await inBatches([1, 2, 3], 0, t.fn);
    expect(t.seen).toEqual([1, 2, 3]);
    expect(t.peak()).toBe(1);
  });

  // A failure must surface to the caller rather than be swallowed, so the
  // caller decides how to report it.
  it('rejects when fn rejects', async () => {
    await expect(
      inBatches([1], 5, async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
  });
});
