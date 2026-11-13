---
title: "Re-sanitize stored posts that predate the external-link fix"
mode: backend
createdAt: "2026-11-06T17:55:27Z"
source: proposed-plan
---

## Summary
sanitizePostHtml used to strip the target/rel attributes it added to external links. That is fixed, but feed sync only rewrites posts still in the feed, and the backfill only creates missing posts. Posts stored before the fix that have since aged out keep the old markup forever.

## Key Decisions
- Re-run the current sanitizer over every stored post body; do not refetch from Substack.
- Idempotent: running it twice changes nothing.

## Implementation
- Add a `--resanitize` mode (or a sibling script) next to `scripts/backfill-posts.ts` that reads each `Post` row, runs `app/lib/sanitizePostHtml.ts` on its body, and updates only rows whose output differs.
- Unit test alongside `scripts/backfill-posts.test.ts` covering an old-markup body and an already-clean body.
- Document the one-time run next to the `posts:backfill` deploy step.