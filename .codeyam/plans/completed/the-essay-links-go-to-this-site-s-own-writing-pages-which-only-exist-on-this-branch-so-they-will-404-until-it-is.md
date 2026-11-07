---
title: "The essay links go to this site's own writing pages, which only exist on this branch, so they will 404 until it is deployed with them. Locally they also 404 because the preview database holds sample posts."
mode: backend
createdAt: "2026-11-07T00:46:53Z"
source: proposed-plan
---

## Summary

The essay links go to this site's own writing pages, which only exist on this branch, so they will 404 until it is deployed with them. Locally they also 404 because the preview database holds sample posts.

At the approval gate for "Running essays linked from Adventures" the user approved the built work past this gap: it differs from what the plan asked for. Built from plan `ne--link-adventures-to-the-running-essays` (now at `.codeyam/plans/completed/ne--link-adventures-to-the-running-essays.md`).

Visitors who finish the Adventures section can now go straight to your running essays.

## What you can now do
- See a **Recent Adventures: Read About My Running Shenanigans** list at the end of Adventures
- Open four running essays, from the Racetoberfest reflection to The Magic of Attempting Hard Things
- Change which essays appear, or their order, by editing the list in `content/site.json`

Read that plan and the code it changed before planning how to close the gap.

## Key Decisions

- **Live site: no code change needed for the 404 itself.** Neither `main` nor `origin/main` has `app/writing/`; the links and the pages ship together on this branch. They resolve once deployed and the documented deploy step (`db:push` → `posts:backfill`) fills the Post table. Even without the backfill, `findPost` reconciles on an unknown slug (feed + archive backfill), and all four essays are public on Substack (verified 2026-11-06 via the posts API).
- **Preview: add the four real essays to the sample posts** (user's choice). Fetched once from Substack's posts API, run through `sanitizePostHtml`, stored with a far-future `updatedAt` so the page never calls Substack during capture (same trick as the writing scenarios).
- **Missing-link check after backfill** (user's choice). After the reconcile, `posts:backfill` lists every `adventures.reading` slug the Post table still lacks. Warn, don't fail: the fill itself worked, and a missing essay is an editorial fix in `site.json`.

## Implementation

### 1. Sample essays

**File**: `.codeyam/seed-data/running-essays.json` (new): four `Post` rows for the slugs in `content/site.json` `adventures.reading`, with real title, subtitle, date, sanitized body, and canonical URL.

**File**: `prisma/seed.ts`: also upsert those Post rows, so `npm run db:seed` gives a local database working essay links.

**Scenarios**: `home-full-page` and `home-mobile` seeds gain the same four Post rows, so following an essay link from the homepage preview lands on a real page.

### 2. Missing-link check

**File**: `app/lib/readingLinks.ts`: `missingReadingSlugs(configured, storedSlugs)`, pure, order-preserving.

**File**: `scripts/backfill-posts.ts`: after the sync, look up the configured slugs and print a warning naming any that are missing (exit code unchanged).

## Tests

- `readingLinks.test.ts`: `missingReadingSlugs` returns only absent slugs, in authored order; empty when all present.
- A seed-data test: every `adventures.reading` slug has a row in `running-essays.json` (catches the next edit to site.json).
- `backfill-posts.test.ts`: warns naming the missing slug; silent when all present; exit code unaffected.