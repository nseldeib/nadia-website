# Handoff — repo consolidation, 2026-08-27

## What happened
`~/new-nadia-website` was retired as the working folder. **This repo
(`~/nadia-website`) is now home.** It already contained everything that folder
had — the rebuild was merged in at `b9e4fe6` ("Merge the Next.js rebuild,
keeping both histories") — plus the old site's history and the GitHub remote.

`~/new-nadia-website` HEAD was `02ac6e9`, a strict ancestor of `rebuild-nextjs`,
with a clean tree. Nothing was lost. Only local, gitignored machine state was
left behind (caches, logs, editor-step.json), and its `editor.local.json` held
no real overrides. `open-codeyam.sh` is byte-identical.

## FIRST THING TO DO: back up the branch
`rebuild-nextjs` has **no upstream** — the rebuild exists only on this laptop.
`main` is also 1 commit ahead of `origin/main`.

    git push -u origin rebuild-nextjs

Deliberately do NOT push `main` yet: it is the default branch serving the live
GitHub Pages site, and pushing it may trigger a Pages rebuild. That belongs to
the cutover, not the backup.

Note the repo is PUBLIC. `.env` and `dev.db` are gitignored in both copies and
only `.env.example` is tracked, so no secrets are exposed.

## Where the project stands
Three deliverables are delivered (rebuild, redesign, design exploration). Two
are deferred to this consolidation-and-cutover phase:
  - publish live at nadiaeldeib.com
  - point nseldeib.com at the same site

Both are blocked by real build work that has NOT been done:
  - `prisma/schema.prisma` still uses `provider = "sqlite"`; GitHub Pages does
    a static export and cannot host the `/api/contact` route or a database.
  - Resend is unwired — `app/api/contact/route.ts` writes the Message row and
    leaves the send as a commented-out TODO, so `emailedAt` is always null.

## Correction to carry forward
The saved decision to use `@codeyam/cms` as the content layer assumed an Astro
site. This site is **Next.js**, and that package is an Astro integration whose
`integrate` CLI refuses to run outside an Astro project. If content-editing
comes up, that choice needs re-researching for Next.js — do not install it.
