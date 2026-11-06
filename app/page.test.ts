import { describe, expect, it, vi, beforeEach } from 'vitest';

// The homepage is exercised for its data wiring only: what it reads before
// rendering and what it schedules for after the response. The section
// components are covered by their own scenarios.
const after = vi.hoisted(() => vi.fn());
const recentPostsForHome = vi.hoisted(() => vi.fn());
const syncPostsQuietly = vi.hoisted(() => vi.fn());

vi.mock('next/server', () => ({ after }));
vi.mock('@/app/lib/posts', () => ({ recentPostsForHome, syncPostsQuietly }));

const { default: Page, dynamic } = await import('./page');

beforeEach(() => {
  vi.resetAllMocks();
  recentPostsForHome.mockResolvedValue([]);
});

describe('homepage data wiring', () => {
  // A post published today must reach the homepage without anyone opening
  // the archive first, so every render schedules a reconcile.
  it('schedules a quiet feed sync to run after the response', async () => {
    await Page();

    expect(after).toHaveBeenCalledOnce();
    expect(after).toHaveBeenCalledWith(syncPostsQuietly);
  });

  // The visitor must never wait on Substack: scheduling is not running.
  it('does not run the sync during the render itself', async () => {
    await Page();

    expect(syncPostsQuietly).not.toHaveBeenCalled();
  });

  // The Writing section reads the three newest stored posts.
  it('reads three recent posts for the Writing section', async () => {
    await Page();

    expect(recentPostsForHome).toHaveBeenCalledWith(3);
  });

  // A cached render would freeze whichever posts existed at build time.
  it('stays rendered per request', () => {
    expect(dynamic).toBe('force-dynamic');
  });
});
