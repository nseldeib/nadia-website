---
title: "ne -- Link Adventures to the running essays"
mode: ui
createdAt: "2026-11-05T22:37:30Z"
prefix: "ne"
order: 5
source: manual
---

## Summary

The Adventures section talks about running ("a slow, happy runner") but links to nothing, while Nadia has written several running essays, including today's "Racetoberfest Reflection: Four Races in Five Weekends." This plan adds a quiet "Read about the running" link list under the Adventures prose, pointing at those essays on `/writing`, so a reader who's interested can go further.

## Key Decisions

- **Curate the links in `content/site.json`, not by tag.** Substack has no tags in the feed, and the right set is an editorial choice. Store slugs and titles in a new optional `adventures.reading` field (`{ label, links: {slug, title}[] }`).
- **Candidate list. Nadia confirms the final set and order in the preview:**
  - `racetoberfest-reflection-four-races`: Racetoberfest Reflection: Four Races in Five Weekends
  - `running-towards-and-past-35`: Running Towards (and Past) 35!
  - `on-stubbornness-trail-running-and`: On Stubbornness, Trail Running, and Questionable Decisions
  - `the-magic-of-attempting-hard-things`: The Magic of Attempting Hard Things (check that it belongs)
- **Links go to internal `/writing/<slug>`,** same tab, like the homepage Writing list. This depends on writing on-site being deployed. If this plan ships first, use the `blog.nseldeib.com/p/<slug>` URLs instead.
- **Match the Work section's link list visually** (`WorkLinkList` styling) rather than inventing a new pattern. But internal links shouldn't get `target="_blank"`, so either give `WorkLinkList` an `external` flag or render a small sibling list. Decide during execution; prefer the flag if it stays small.
- **Copy (label) is Nadia's to approve.** Placeholder: "Read about the running".

## Implementation

### 1. Content and type

**File**: `content/site.json`, **File**: `content/site.ts`

Add `adventures.reading` with the curated links, and add the optional field to the `adventures` type.

### 2. Render the list

**File**: `components/Adventures.tsx`

Below the paragraphs in `section.body`, render the label and links when `adventures.reading` exists.

### 3. Isolation scenario

**File**: `app/isolated-components/Adventures/page.tsx`

Add scenarios with and without `reading`.

## Reused existing code

- `WorkLinkList` from `components/work/WorkLinkList.tsx` (glossary entry: `WorkLinkList`)
- `Adventures` from `components/Adventures.tsx`
- link-row styling in `components/Work.module.css`

## Scenarios to Demonstrate

- Adventures with three or four running links, desktop and mobile
- Adventures with no `reading` field (unchanged from today)
- A long title wrapping inside the narrow column beside the photo rotator