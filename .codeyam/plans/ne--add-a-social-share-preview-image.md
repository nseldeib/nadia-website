---
title: "ne -- Add a social share preview image"
mode: ui
createdAt: "2026-11-05T22:37:08Z"
prefix: "ne"
order: 4
source: manual
---

## Summary

Links to nadiaeldeib.com shared on LinkedIn, X, iMessage or Slack show no image, because the site has no `og:image`. `app/layout.tsx` sets `openGraph` title, description and URL but no image, and there is no `opengraph-image` file. This plan adds a site-wide 1200×630 share image so every page, including `/writing` and its posts, gets a large preview card.

## Key Decisions

- **Use a static file convention (`app/opengraph-image.jpg` + `opengraph-image.alt.txt`), not a generated `ImageResponse`.** The site's identity is its photography (the `hero-*` frames), and a static crop keeps that without adding a runtime. See `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`.
- **Source image: crop from `public/images/hero-summit.e6c47185.jpg`** (2000×975), or whichever hero frame Nadia prefers. Confirm the choice in the preview. Keep the file under about 300KB.
- **Add `twitter: { card: 'summary_large_image' }`** to the root metadata, so X uses the large card instead of the small summary.
- **Per-post cover images are out of scope.** Substack's archive API exposes `cover_image`, but the `Post` table doesn't store it. It's a natural follow-up once the backfill plan has landed. Until then, posts inherit the site image.

## Implementation

### 1. Share image

**New file**: `app/opengraph-image.jpg`, **New file**: `app/opengraph-image.alt.txt`

1200×630 crop of the chosen hero frame. Alt text describes the photo (for example "Nadia on a summit above the clouds"). Confirm the wording with Nadia.

### 2. Large Twitter/X card

**File**: `app/layout.tsx`

Add `twitter: { card: 'summary_large_image' }` to `metadata`.

### 3. Verify

Confirm in the built HTML that `og:image`, `og:image:width/height`, `og:image:alt` and `twitter:image` are present on `/`, `/writing` and a post page.

## Reused existing code

- `SITE_URL` / `metadataBase` in `app/layout.tsx` (resolves the image to an absolute URL)
- hero frames under `public/images/`

## Scenarios to Demonstrate

- Homepage `<head>` with og:image tags
- A post page inheriting the site image
- The image itself at 1200×630 and at a small thumbnail size, to check it still reads