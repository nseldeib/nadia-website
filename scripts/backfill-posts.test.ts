import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// The script runs `main()` on import, so each test re-imports it fresh with
// the database and the reconcile mocked, then waits for it to settle.
const syncPostsFromFeed = vi.fn();
const count = vi.fn();
const disconnect = vi.fn();

vi.mock('../app/lib/loadEnv', () => ({}));
vi.mock('../app/lib/prisma', () => ({
  prisma: { post: { count: () => count() }, $disconnect: () => disconnect() },
}));
vi.mock('../app/lib/posts', () => ({
  syncPostsFromFeed: (...a: unknown[]) => syncPostsFromFeed(...a),
}));

async function runScript() {
  vi.resetModules();
  await import('./backfill-posts');
  await vi.waitFor(() => expect(disconnect).toHaveBeenCalled());
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  count.mockResolvedValue(25);
  disconnect.mockResolvedValue(undefined);
  process.exitCode = undefined;
});

afterEach(() => {
  process.exitCode = undefined;
  vi.restoreAllMocks();
});

describe('backfill-posts main', () => {
  // A one-off fill must not be skipped because the store looks fresh.
  it('forces a full reconcile and reports the stored total', async () => {
    syncPostsFromFeed.mockResolvedValue({ added: 20, updated: 0, backfilled: 5 });

    await runScript();

    expect(syncPostsFromFeed).toHaveBeenCalledWith({ force: true });
    expect(console.log).toHaveBeenCalledWith('Post table now holds 25 post(s).');
    expect(process.exitCode).toBeUndefined();
  });

  // A deploy step running this must not carry on as if it had worked.
  it('exits non-zero when the feed could not be read', async () => {
    syncPostsFromFeed.mockResolvedValue({ added: 0, updated: 0, backfilled: 0, failed: 'down' });

    await runScript();

    expect(process.exitCode).toBe(1);
  });

  // A crash still releases the database connection and fails the deploy step.
  it('exits non-zero and still disconnects when the reconcile throws', async () => {
    syncPostsFromFeed.mockRejectedValue(new Error('boom'));

    await runScript();

    expect(process.exitCode).toBe(1);
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
