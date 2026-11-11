---
title: "The plan asked for tests of the existing RSS parser against a captured feed sample; those were not added, and the new archive tests use hand-written samples shaped like the live responses checked on 2026-11-05."
mode: backend
createdAt: "2026-11-09T20:27:30Z"
source: proposed-plan
---

## Summary

The plan asked for tests of the existing RSS parser against a captured feed sample; those were not added, and the new archive tests use hand-written samples shaped like the live responses checked on 2026-11-05.

At the approval gate for "Backfill posts that aged out of the Substack feed" the user approved the built work past this gap: it differs from what the plan asked for. Built from plan `ne--backfill-posts-that-aged-out-of-the-substack-feed` (now at `.codeyam/plans/completed/ne--backfill-posts-that-aged-out-of-the-substack-feed.md`).

Older Substack posts that have dropped out of the feed now stay on your Writing page instead of disappearing.

## What you can now do
- See every past post on `/writing`, not just the ~20 newest the feed still lists
- Run `npm run posts:backfill` once to pull in posts the site has never stored
- External links in posts open in a new tab, as intended
- Pages load reliably again in the preview (the database connection always uses the right port)

Read that plan and the code it changed before planning how to close the gap.