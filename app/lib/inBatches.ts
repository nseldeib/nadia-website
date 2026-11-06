/**
 * Run `fn` over `items` with at most `size` calls in flight at once.
 *
 * Bounded rather than unbounded because the Postgres connection pool is small
 * and a burst of upserts would only queue; batched rather than serial because
 * the database is in another region and serial round trips cost seconds.
 */
export async function inBatches<T>(
  items: readonly T[],
  size: number,
  fn: (item: T) => Promise<unknown>,
): Promise<void> {
  const step = Math.max(1, Math.floor(size));
  for (let i = 0; i < items.length; i += step) {
    await Promise.all(items.slice(i, i + step).map(fn));
  }
}
