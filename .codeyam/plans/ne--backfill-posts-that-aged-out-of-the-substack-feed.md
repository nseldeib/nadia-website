---
title: "ne -- Backfill posts that aged out of the Substack feed"
mode: backend
createdAt: "2026-11-05T22:36:31Z"
prefix: "ne"
source: manual
---

## Summary

The writing archive silently loses posts. Substack's RSS (`https://blog.nseldeib.com/feed`) returns only the 20 most recent posts, and the store was meant to remember older ones the first time it saw them, but the store never saw them. Since the writing plan was written (Aug 31), three new posts (Sep 1, Oct 13, Nov 5) pushed three out of the feed, and the `Post` table does not exist yet in the Neon database, so nothing was cached:

- `our-vision-for-codeyam-why-build` (2024-07-24)
- `taming-softwares-complexity-as-ai` (2024-11-26)
- `founder-faqs-did-i-always-want-to` (2024-12-10)

Substack has 23 public posts and the site would serve 20. After this change, reconcile treats Substack's archive API as the authoritative list of slugs, backfills anything the store is missing, and a one-time `npm run posts:backfill` fills the production store before the feature ships.

## Key Decisions

- **Make the archive API the source for the list of slugs, and keep RSS as the source for bodies.** `GET https://blog.nseldeib.com/api/v1/archive?sort=new&limit=50` returned all 23 posts (verified 2026-11-05). `GET /api/v1/posts/<slug>` returns `body_html` for posts that have aged out (verified on `our-vision-for-codeyam-why-build`, 11,652 chars). With this, the 20-item window stops being a correctness risk. The store becomes a cache instead of the only memory of old posts.
- **Pagination must be confirmed during execution.** In testing, the archive endpoint rejected `offset=0`, `offset=12` and `offset=24` with `"Invalid value"`. Without `offset`, `limit=50` returned everything. Find the working pagination form (or confirm the cap) before trusting it past 50 posts, and degrade to "what we got" rather than failing.
- **Backfill is create-only, with bounded concurrency** (reuse the `CONCURRENCY = 5` pattern in `syncPostsFromFeed`). Posts still in RSS are refreshed by the existing upsert path. The backfill only inserts slugs that are absent from both the store and the feed.
- **Skip any post whose `audience` is not `everyone`.** Today every post is public. A future paid post must not be mirrored in full.
- **The archive API's `body_html` may differ from RSS `content:encoded`.** Run it through the same `sanitizePostHtml` and confirm against a captured fixture that no Substack chrome (buttons, forms, `pencraft` classes) survives.
- **Production schema is a deploy step, not a build step.** `npm run build` only runs `prisma generate`. Before deploying, run `npm run db:push` and then `npm run posts:backfill` against production. Confirm at execution whether `.env`'s `DATABASE_URL` is the production Neon DB or a dev branch. Document this in `DATABASE.md`.

## Implementation

### 1. Archive index and single-post fetch

**File**: `app/lib/substackFeed.ts`

Add `fetchArchiveIndex()` returning `{ok:true, entries:{slug, audience, publishedAt}[]} | {ok:false, reason}` and `fetchPostBySlug(slug)` returning a `FeedPost`-shaped result. Both mirror `fetchFeed`: never throw, `AbortSignal.timeout(FEED_TIMEOUT_MS)`, `next.revalidate`.

### 2. Backfill during reconcile

**File**: `app/lib/posts.ts`

After the RSS upsert in `syncPostsFromFeed`, diff the archive slugs against the store plus the feed. For each missing public slug, fetch, sanitize and `create`. Extend `SyncResult` with `backfilled: number`. An archive failure must not fail the reconcile: RSS results still land.

### 3. One-time backfill script

**New file**: `scripts/backfill-posts.ts`

Loads env via `app/lib/loadEnv` (like `prisma/seed.ts`), calls `syncPostsFromFeed({ force: true })`, and prints the `SyncResult`. Add `"posts:backfill": "npx tsx scripts/backfill-posts.ts"` to `package.json`.

### 4. Document the deploy step

**File**: `DATABASE.md`

Add a section: the `Post` table must be pushed to production (`npm run db:push`) and backfilled once before the writing routes deploy.

### 5. Tests for the writing data layer (none exist today)

**New file**: `app/lib/posts.test.ts`, **New file**: `app/lib/substackFeed.test.ts`

Cover `parseFeed` and `parseArchive` against captured fixtures. Mock `./prisma` and `./substackFeed` the way `app/sitemap.test.ts` mocks `./lib/posts`.

## Reused existing code

- `syncPostsFromFeed`, `SyncResult` from `app/lib/posts.ts`
- `fetchFeed`, `FEED_TIMEOUT_MS`, `FEED_REVALIDATE_SECONDS`, `FeedPost` from `app/lib/substackFeed.ts`
- `sanitizePostHtml` from `app/lib/sanitizePostHtml.ts`
- env loading from `app/lib/loadEnv.ts`, script shape from `prisma/seed.ts`
- `vi.hoisted` + `vi.mock` pattern from `app/sitemap.test.ts`

## Reproduction Test

Reconcile drops any post that has aged out of the RSS feed's 20-item window.

**Target**: `app/lib/posts.test.ts` (new). Run with `codeyam-editor editor refresh-tests --test posts`.

```ts
// A post absent from RSS but present in Substack's archive must still be stored.
it("backfills posts that have aged out of the RSS window", async () => {
  fetchFeed.mockResolvedValue({ ok: true, posts: [feedPost("you-can-just-ship-things")] });
  fetchArchiveIndex.mockResolvedValue({
    ok: true,
    entries: [
      { slug: "you-can-just-ship-things", audience: "everyone", publishedAt: new Date("2026-07-06") },
      { slug: "our-vision-for-codeyam-why-build", audience: "everyone", publishedAt: new Date("2024-07-24") },
    ],
  });
  fetchPostBySlug.mockResolvedValue({ ok: true, post: feedPost("our-vision-for-codeyam-why-build") });
  prisma.post.findMany.mockResolvedValue([]);

  const result = await syncPostsFromFeed({ force: true });

  expect(result.backfilled).toBe(1);
  expect(prisma.post.create).toHaveBeenCalledWith(
    expect.objectContaining({ data: expect.objectContaining({ slug: "our-vision-for-codeyam-why-build" }) }),
  );
});
```

Status: PROPOSED. Confirm it fails first during execution. Expected failure: `fetchArchiveIndex` is not exported from `./substackFeed`, and `result.backfilled` is `undefined`.

## Scenarios to Demonstrate

- `/writing` with all 23 posts, oldest "Our Vision for CodeYam" (Jul 2024) at the bottom
- `/writing/our-vision-for-codeyam-why-build`, a backfilled post, renders cleanly with no Substack buttons or forms
- Archive API unreachable: `/writing` still renders the RSS posts
- A non-public post in the archive is not mirrored