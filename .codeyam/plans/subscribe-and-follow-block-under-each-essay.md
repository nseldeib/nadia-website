---
title: "Subscribe and follow block under each essay"
mode: ui
createdAt: "2026-11-09T20:36:09Z"
source: manual
---

## Summary
Add a short subscribe/follow block under every essay at `/writing/[slug]`, so a reader who arrives from search can subscribe or follow without leaving: Subscribe on Substack, follow @nadiasfieldnotes on Instagram and Threads, and try CodeYam. Also advertise the RSS feed in the page head, so feed readers find the essays automatically.

## Key Decisions
- One block, below the existing Substack credit and the Older/Newer links, styled to match the post page (`app/writing/[slug]/post.module.css`).
- Links come from `content/site.json` (Instagram, Threads, Substack and CodeYam are already there), not hard-coded.
- The Substack subscribe link goes to the publication's subscribe page; the CodeYam link reuses the UTM helper from the CodeYam calls-to-action plan if that plan has landed first.
- `<link rel="alternate" type="application/rss+xml">` points at the Substack feed (`FEED_URL` in `app/lib/substackFeed.ts`).

## Implementation
- New `PostFollow` component, rendered in `app/writing/[slug]/page.tsx`.
- Add the RSS alternate to the layout metadata (`alternates.types`).
- Scenario: re-capture `writing-post`, plus an isolated `PostFollow` scenario; a unit test for the link list.