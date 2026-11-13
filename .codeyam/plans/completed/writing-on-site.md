---
title: "Writing on-site"
mode: ui
createdAt: "2026-08-31T17:07:09Z"
source: manual
---

## What this delivers

Writing moves onto nadiaeldeib.com. Today the Writing section lists three
hardcoded posts in `content/site.json` and every one of them leaves for
`blog.nseldeib.com`. After this, the posts are pages on this site, the archive
lives at `/writing`, and the homepage list opens them instead of leaving.

Nadia keeps publishing on Substack exactly as she does now. Nothing about her
writing workflow changes.

## Why the feed is the source

Verified against the live feed during planning, not assumed:

- `https://blog.nseldeib.com/feed` returns HTTP 200, 645KB, **20 items**
  spanning Jul 2024 → Jul 2026 (oldest: "Our Vision for CodeYam").
- **Zero posts are paywalled.** Every item carries its full body in
  `content:encoded` — 15K–49K characters each, not a teaser.
- The body HTML is regular and small-vocabulary: `p` (929), `h2` (44),
  `ul`/`li` (27/142), `figure`/`img`/`figcaption` (82/84/65), `a`, `strong`,
  `em`.
- All images are on `substackcdn.com` and already ship correct `srcset`s.

So the content is there and it is re-renderable.

## Why the body must be stripped, not embedded

The same inspection found Substack's own UI baked into every post body: 148
`<button>` + `<svg>` pairs (image expand / restack controls), 25 `<form>`s with
52 `<input>`s (subscribe boxes), and `pencraft pc-*` utility classes throughout.

Rendering `content:encoded` as-is would put Substack subscribe forms and image
controls in the middle of the article. There is no "just embed it" option — a
sanitizing pass to an allowlist is the minimum viable version, not a refinement.

## Why posts are cached

Substack's RSS returns only the **20 most recent** posts. That is currently
Nadia's entire archive, so nothing is missing today — but the 21st post pushes
"Our Vision for CodeYam" off the feed, and off this site, silently.

So: the feed is the source of *new* posts; a `Post` table is the memory of
*old* ones. A post seen once is kept. The archive only ever grows.

## Surfaces

1. `/writing` — the archive index. Every post, newest first.
2. `/writing/<slug>` — a post. Slugs mirror Substack's, so
   `/writing/you-can-just-ship-things` is the obvious counterpart to an
   already-shared link.
3. The homepage Writing section — keeps its short recent list, but the links go
   internal and it gains a way through to the full archive.

## The post footer

Nadia asked for the subscribe invitation, next/previous, and a way back to the
site — explicitly **without competing CTAs**. So it is not three buttons:
subscribe is the single primary action, and next/previous and the way back sit
below it as quiet navigation (text and rules). To be reviewed in the preview at
the Demo step.

## Open visual question

Night Field was designed for a one-page site of short sections. A 48,000-character
post is a different reading task, and light-on-dark at that length is harder
work than the homepage ever asks of anyone. The system already carries
`.surface-light` (the About band) and `--measure: 62ch`. Try the post body on
the light surface, and show both.

## Reference implementations to follow

- **Outbound HTTP**: `app/lib/sendNotification.ts` — `fetch` in a try/catch
  returning `{ok:true} | {ok:false, reason}` rather than throwing. The feed
  fetch mirrors this: a Substack outage must degrade `/writing` to what is
  already cached, never 500 it.
- **Scenario seeding**: keyed by model name, as in
  `.codeyam/scenarios/home-full-page.json` (`"seed": {"Message":[...]}`).
  Post scenarios use `{"Post":[...]}`.
- **Feed determinism in scenarios**: `mocks.http` with an absolute URL key
  (`"GET https://blog.nseldeib.com/feed"`), per `FEATURE_PATTERNS.md`. No new
  mechanism needed.
- **Isolation harness**: `app/isolated-components/<Component>/page.tsx` reading
  `?s=` and wrapping in `#codeyam-capture`.
- **Canonical URLs**: `siteUrl()` from `app/lib/siteUrl.ts`.

## Files

**New**
- `prisma/schema.prisma` — a `Post` model (slug, title, published date, body
  HTML, canonical Substack URL, first-seen timestamp)
- `app/lib/substackFeed.ts` — fetch and parse the RSS
- `app/lib/sanitizePostHtml.ts` — strip to the allowlist
- `app/lib/posts.ts` — reconcile feed against store; read for rendering
- `app/writing/page.tsx`, `app/writing/[slug]/page.tsx`
- Post body / footer / archive-row components + their isolation pages + CSS
  modules

**Modified**
- `components/writing/PostList.tsx` — internal links; `target="_blank"` comes off
- `components/Writing.tsx` — recent posts from the store, link to the archive
- `app/sitemap.ts` — `/writing` and every post. The file's own comment
  anticipates this: *"If the site ever grows a real second route, it belongs
  here."*
- `next.config.ts` — allowlist `substackcdn.com`
- `prisma/schema.prisma` — the `Message` comment currently asserts "Page content
  lives in the repo as files"; that stops being true and the comment must say so
- `content/site.json` / `site.ts` — the hardcoded `posts` array's role changes

## Known tensions, carried deliberately

1. **Content enters the database for the first time.** The schema comment
   states the opposite invariant. Defensible — a cached post mirrors something
   authored elsewhere rather than being authored here — but it is a real
   departure and the comment gets rewritten rather than quietly contradicted.
2. **`prisma/seed.ts` is hardcoded to `raw?.seed?.Message`.** Scenario capture
   uses the editor's seed adapter so nothing is blocked, but `npm run db:seed`
   ignores posts until it is generalized.
3. **Duplicate content across two domains.** Substack's canonical tag is not
   ours to set, so both sides self-canonicalize and search engines pick. Minor
   for a personal site, but the ownership benefit is likely rather than
   guaranteed, and it was named before approval rather than discovered after.

## Empty state

With nothing cached and the feed unreachable, `/writing` shows the lede and the
subscribe invitation — not an empty list and not an error. Production starts
empty, as always.

## Data states → scenarios

- nothing cached yet (day one, or feed unreachable)
- a handful of posts
- the full 20-post archive, exercising the index at real length
- a long post with images, subheads and captions (the trail-running post is 48K)
- a short post, where the footer must not float
- a cached post no longer in the feed — the reason the store exists