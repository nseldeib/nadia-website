---
title: "Sharper homepage and writing page titles and descriptions"
mode: ui
createdAt: "2026-11-09T20:33:40Z"
source: manual
---

## Summary
Make the homepage and `/writing` titles and descriptions carry the words people actually search for. Today the homepage title is just "Nadia Eldeib" and `/writing` is "Writing · Nadia Eldeib". Essay pages already use each essay's own title and subtitle, so they stay as they are.

## Key Decisions
- Homepage title, e.g. "Nadia Eldeib, CEO & Co-founder of CodeYam" (final wording confirmed with Nadia at the plan gate).
- Homepage description names CodeYam, AI-assisted software building, and workshops in one natural sentence, within about 155 characters.
- `/writing` title, e.g. "Writing on founding, running & adventures · Nadia Eldeib", with a matching description.
- The Open Graph title and description match, so shared links read the same.
- Copy lives in `content/site.json`, not inline in `app/layout.tsx`.

## Implementation
- Add `meta` fields to `content/site.json` and its type in `content/site.ts`.
- `app/layout.tsx` and `app/writing/page.tsx` read from them.
- Update the existing metadata tests.