import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// The script runs `main()` on import, so each test re-imports it fresh with
// the database and the reconcile mocked, then waits for it to settle.
const syncPostsFromFeed = vi.fn();
const count = vi.fn();
const findMany = vi.fn();
const disconnect = vi.fn();

vi.mock('../app/lib/loadEnv', () => ({}));
vi.mock('../app/lib/prisma', () => ({
  prisma: {
    post: { count: () => count(), findMany: (...a: unknown[]) => findMany(...a) },
    $disconnect: () => disconnect(),
  },
}));
vi.mock('../app/lib/posts', () => ({
  syncPostsFromFeed: (...a: unknown[]) => syncPostsFromFeed(...a),
}));
vi.mock('../content/site', () => ({
  default: {
    adventures: {
      reading: {
        links: [
          { slug: 'kept-essay', title: 'Kept' },
          { slug: 'typo-essay', title: 'Typo' },
        ],
      },
    },
  },
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
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  count.mockResolvedValue(25);
  findMany.mockResolvedValue([{ slug: 'kept-essay' }, { slug: 'typo-essay' }]);
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

  // A linked essay the table lacks is named, so the broken link is caught at
  // deploy rather than by a reader; the fill still counts as a success.
  it('warns naming a linked essay the table lacks without failing', async () => {
    syncPostsFromFeed.mockResolvedValue({ added: 1, updated: 0, backfilled: 0 });
    findMany.mockResolvedValue([{ slug: 'kept-essay' }]);

    await runScript();

    expect(console.warn).toHaveBeenCalledOnce();
    expect(vi.mocked(console.warn).mock.calls[0][0]).toContain('typo-essay');
    expect(vi.mocked(console.warn).mock.calls[0][0]).not.toContain('kept-essay');
    expect(process.exitCode).toBeUndefined();
  });

  // Every link resolving is the normal case and must stay quiet.
  it('stays silent when every linked essay is stored', async () => {
    syncPostsFromFeed.mockResolvedValue({ added: 1, updated: 0, backfilled: 0 });

    await runScript();

    expect(console.warn).not.toHaveBeenCalled();
  });

  // The check is a warning only: a failed feed read still sets the exit code,
  // and a missing essay does not mask or change it.
  it('keeps the failed-read exit code when an essay is also missing', async () => {
    syncPostsFromFeed.mockResolvedValue({ added: 0, updated: 0, backfilled: 0, failed: 'down' });
    findMany.mockResolvedValue([]);

    await runScript();

    expect(console.warn).toHaveBeenCalledOnce();
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
