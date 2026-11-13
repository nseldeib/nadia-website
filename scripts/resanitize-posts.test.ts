import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// The script runs `main()` on import, so each test re-imports it fresh with
// the database mocked, then waits for it to settle. The sanitizer is real.
const findMany = vi.fn();
const update = vi.fn();
const disconnect = vi.fn();

vi.mock('../app/lib/loadEnv', () => ({}));
vi.mock('../app/lib/prisma', () => ({
  prisma: {
    post: { findMany: (...a: unknown[]) => findMany(...a), update: (...a: unknown[]) => update(...a) },
    $disconnect: () => disconnect(),
  },
}));

const OLD_EXTERNAL = '<p><a href="https://example.com">x</a></p>';
const CLEAN = '<p>Already clean.</p>';
const originalArgv = process.argv;

async function runScript(args: string[] = []) {
  process.argv = [...originalArgv.slice(0, 2), ...args];
  vi.resetModules();
  await import('./resanitize-posts');
  await vi.waitFor(() => expect(disconnect).toHaveBeenCalled());
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  findMany.mockResolvedValue([
    { id: 1, slug: 'old', bodyHtml: OLD_EXTERNAL },
    { id: 2, slug: 'clean', bodyHtml: CLEAN },
  ]);
  update.mockResolvedValue({});
  disconnect.mockResolvedValue(undefined);
  process.exitCode = undefined;
});

afterEach(() => {
  process.argv = originalArgv;
  process.exitCode = undefined;
  vi.restoreAllMocks();
});

describe('resanitize-posts main', () => {
  // Only the stale row is rewritten, with the current sanitizer's output.
  it('updates only the posts whose cleaned body differs', async () => {
    await runScript();

    expect(update).toHaveBeenCalledTimes(1);
    const [{ where, data }] = update.mock.calls[0];
    expect(where).toEqual({ id: 1 });
    expect(data.bodyHtml).toContain('target="_blank"');
    expect(console.log).toHaveBeenCalledWith('re-sanitized: old');
    expect(console.log).toHaveBeenCalledWith('Checked 2 post(s); re-sanitized 1.');
    expect(process.exitCode).toBeUndefined();
  });

  // A dry run against production must not write a single row.
  it('writes nothing on a dry run but reports what would change', async () => {
    await runScript(['--dry-run']);

    expect(update).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('would re-sanitize: old');
    expect(console.log).toHaveBeenCalledWith('Checked 2 post(s); would re-sanitize 1.');
  });

  // A crash still releases the database connection and fails the run.
  it('exits non-zero and still disconnects when the read throws', async () => {
    findMany.mockRejectedValue(new Error('boom'));

    await runScript();

    expect(process.exitCode).toBe(1);
    expect(disconnect).toHaveBeenCalled();
  });
});
