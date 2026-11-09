---
title: "The script has not been run against real posts yet: the database in .env has no posts table, so the database writes are only checked with a stand-in database in tests."
mode: backend
createdAt: "2026-11-09T16:23:40Z"
source: proposed-plan
---

## Summary

The script has not been run against real posts yet: the database in .env has no posts table, so the database writes are only checked with a stand-in database in tests.

At the approval gate for "Re-clean older posts with the external-link fix" the user approved the built work past this gap: it differs from what the plan asked for. Built from plan `re-sanitize-stored-posts-that-predate-the-external-link-fix` (now at `.codeyam/plans/completed/re-sanitize-stored-posts-that-predate-the-external-link-fix.md`).

Posts saved before the external-link fix can now be cleaned up in one command, so old posts get the same safe links as new ones.

## What you can now do
- Run `npm run posts:resanitize` to update older stored posts
- Add `--dry-run` to see which posts would change without changing anything
- Only posts that actually need it get rewritten; the rest are left untouched

Read that plan and the code it changed before planning how to close the gap.