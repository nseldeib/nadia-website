---
title: "ne -- Hotfix the live homepage post list"
mode: ui
createdAt: "2026-11-05T22:37:08Z"
prefix: "ne"
source: manual
---

## Summary

The live homepage's "What I write about" section lists three July posts as the latest. Since then there have been three newer posts: Racetoberfest (Nov 5), Orthogonal Goals (Oct 13), and Running Towards (and Past) 35 (Sep 1). Production still serves the hardcoded `writing.posts` list in `content/site.json`, because the writing on-site feature hasn't shipped. This is a stopgap that updates the list so the live site is current today, deployed separately from the writing work.

## Key Decisions

- **Ship from a hotfix branch off `origin/main`, not local `main`.** Local `main` now carries the unshipped writing feature (commit `58493a1`), where the homepage reads from the `Post` store and `writing.posts` is no longer read anywhere. Editing it on `main` would change nothing visible. Branch `hotfix/homepage-posts` from `origin/main`, change only `content/site.json`, and deploy that.
- **Links stay external to `blog.nseldeib.com`**, matching the current live behavior. Internal `/writing/...` links would 404 in production.
- **Dates follow the existing short format** (`"Jul 13"`). These are all 2026, the same as the current entries.
- **Don't delete the array here.** Once writing on-site deploys, `writing.posts` (and its type in `content/site.ts`) is dead code. Delete it in that deploy, not in this one.
- **Merge the hotfix back into `main`.** This should be conflict-free, because the writing commit didn't touch `content/site.json`.

## Implementation

### 1. Replace the three posts

**File**: `content/site.json`

On `hotfix/homepage-posts` (from `origin/main`), set `writing.posts` to:

- `https://blog.nseldeib.com/p/racetoberfest-reflection-four-races` · `Nov 5` · "Racetoberfest Reflection: Four Races in Five Weekends"
- `https://blog.nseldeib.com/p/how-orthogonal-goals-led-to-unexpected` · `Oct 13` · "How Orthogonal Goals Led to Unexpected Progress"
- `https://blog.nseldeib.com/p/running-towards-and-past-35` · `Sep 1` · "Running Towards (and Past) 35!"

Check the long Racetoberfest title in the `PostList` layout at mobile width. Shorten to "Racetoberfest: Four Races in Five Weekends" if it wraps badly, the same way the SPC title was shortened.

## Reused existing code

- `PostList` from `components/writing/PostList.tsx` (glossary entry: `PostList`)
- `Writing` from `components/Writing.tsx` (glossary entry: `Writing`)

## Scenarios to Demonstrate

- Homepage Writing section with the three new posts, desktop
- Same at mobile width with the longest title