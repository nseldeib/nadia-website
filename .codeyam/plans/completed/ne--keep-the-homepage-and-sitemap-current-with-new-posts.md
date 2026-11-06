---
title: "ne -- Keep the homepage and sitemap current with new posts"
mode: backend
createdAt: "2026-11-05T22:36:47Z"
prefix: "ne"
order: 2
source: manual
dependsOn: ["ne--backfill-posts-that-aged-out-of-the-substack-feed"]
---

## Summary

New posts don't reach the two surfaces that only read the store. **The sitemap is prerendered once at build time** (`○ /sitemap.xml` in the build output). Its post list freezes at deploy, and if the store is empty at build it lists no posts at all. **The homepage never reconciles.** `recentPostsForHome` deliberately only reads, so a post published this morning won't appear in the homepage Writing section until someone happens to visit `/writing` or a post page. After this change, both stay current within the existing one-hour freshness window, with no redeploy and no `/writing` visit needed.

## Key Decisions

- **Sitemap: `export const revalidate = FEED_REVALIDATE_SECONDS`** rather than `force-dynamic`. Per `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md`, the sitemap is cached unless it uses a dynamic config option. Hourly regeneration matches the feed cadence, and crawlers still get a cached response. The existing try/catch already makes a build with no DB return the two fixed routes.
- **Homepage: reconcile inside `after()` from `next/server`.** This runs after the response is sent, so the homepage keeps its "read only, never wait" guarantee (the 15-second first render described in `recentPostsForHome`'s comment is exactly what we must not bring back). The next visitor sees the new post. `syncPostsFromFeed` already skips work when the store is under an hour old (`storeIsFresh`), so most visits cost one query.
- **Swallow errors inside the `after` callback.** `after` runs even when the response fails. A Substack outage must not produce unhandled rejections in logs.
- **Considered a Vercel cron and declined it.** It would need a secret-protected route plus a `vercel.json` schedule for a site that gets steady enough traffic. `after()` gets the same result with no new surface.

## Implementation

### 1. Revalidate the sitemap hourly

**File**: `app/sitemap.ts`

Add `export const revalidate = FEED_REVALIDATE_SECONDS;` (import from `./lib/substackFeed`). Confirm in the build output that `/sitemap.xml` is no longer plain static (`○` → ISR).

### 2. Reconcile after the homepage responds

**File**: `app/page.tsx`

Call `after(() => syncPostsFromFeed().catch(() => {}))` inside `Page`, alongside `recentPostsForHome(3)`. Update the comment in `app/lib/posts.ts` above `recentPostsForHome` so it no longer says the homepage never triggers a sync: it still never *waits* on one.

### 3. Tests

**File**: `app/sitemap.test.ts`, **New file**: `app/page.test.ts`

## Reused existing code

- `syncPostsFromFeed`, `recentPostsForHome` from `app/lib/posts.ts`
- `FEED_REVALIDATE_SECONDS` from `app/lib/substackFeed.ts`
- `sitemap` from `app/sitemap.ts` (glossary entry: `sitemap`, test `app/sitemap.test.ts`)

## Reproduction Test

The sitemap has no revalidation config, so Next prerenders it once and never updates it.

**Target**: `app/sitemap.test.ts`. Run with `codeyam-editor editor refresh-tests --test sitemap`.

```ts
// The sitemap must regenerate so newly stored posts reach crawlers without a redeploy.
it("is revalidated on the feed cadence rather than frozen at build", async () => {
  const mod = await import("./sitemap");
  expect(mod.revalidate).toBe(3600);
});
```

Status: PROPOSED. Confirm it fails first during execution. Expected failure: `mod.revalidate` is `undefined`.

## Scenarios to Demonstrate

- Homepage with a store an hour stale: the first render shows the old three posts, and the next render includes the newly published post
- Homepage while Substack is unreachable: renders normally, with no error logged from the `after` callback
- `/sitemap.xml` after a new post is stored: includes `/writing/<new-slug>` without a rebuild