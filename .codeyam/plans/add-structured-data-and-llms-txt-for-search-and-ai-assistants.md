---
title: "Add structured data and llms.txt for search and AI assistants"
mode: backend
createdAt: "2026-11-09T20:33:40Z"
source: manual
---

## Summary
Add machine-readable facts (JSON-LD structured data) and an `llms.txt` file, so that Google and AI assistants (ChatGPT, Claude, Perplexity) can identify Nadia, connect her to CodeYam and her social accounts, and cite her essays correctly. Nothing visible on the site changes.

## Key Decisions
- Homepage: a `Person` record (name, job title "CEO & Co-founder, CodeYam", image, `sameAs` links to Instagram/Threads @nadiasfieldnotes, Substack, LinkedIn, and codeyam.com) plus an `Organization` record for CodeYam (url https://codeyam.com), with Nadia as founder.
- Each `/writing/[slug]` page: a `BlogPosting` record (headline, description, datePublished, image = cover, author = the Person, `sameAs` = the Substack URL).
- `/llms.txt`: a short plain-text summary of who Nadia is, what CodeYam is (with links to codeyam.com for workshops and the product), and links to the key pages and essays. Generated as a route so the essay list stays current.
- All links come from `content/site.json` and `app/lib/siteUrl.ts`, not hard-coded duplicates.

## Implementation
- New `app/lib/structuredData.ts`: pure builders `personJsonLd()`, `organizationJsonLd()`, `blogPostingJsonLd(post)`, with unit tests.
- `app/page.tsx` and `app/writing/[slug]/page.tsx`: render `<script type="application/ld+json">`.
- New `app/llms.txt/route.ts`: a text response built from site content and `listPosts()`, with a unit test.
- Verify with Google's Rich Results Test after deploy.