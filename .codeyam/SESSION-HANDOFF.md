# Handoff — Vercel cutover, 2026-08-27

Supersedes the repo-consolidation handoff. Everything that one told you to do
is done: `~/new-nadia-website` is retired, `rebuild-nextjs` is pushed to
`origin`, and the two build blockers it named (SQLite, unwired Resend) were
fixed in `277e97a`.

## Where the project stands

Three deliverables delivered: the rebuild, the Night Field redesign, the design
exploration. Two remain, both non-build and both in flight as of this session:

  - publish live at nadiaeldeib.com
  - point nseldeib.com at the same site

## Live serving state — READ BEFORE TOUCHING `main`

| Domain | Serves | Registrar / NS |
| --- | --- | --- |
| nadiaeldeib.com | **GitHub Pages, from `main`** | Squarespace, `ns-cloud-*.googledomains.com` |
| nseldeib.com | Vercel, project `v0-placeholder-website-concept` | Namecheap, `dns*.registrar-servers.com` |

GitHub Pages is ACTIVE (`gh api repos/nseldeib/nadia-website/pages` → status
`built`, cname `nadiaeldeib.com`, HTTPS cert approved through 2026-11-05).

**The trap:** merging `rebuild-nextjs` into `main` and pushing triggers a Pages
rebuild. Pages cannot build a Next.js app — it would serve a broken site at
nadiaeldeib.com while DNS still points there. Move DNS off Pages FIRST, then
merge. The root `CNAME` file is load-bearing until Pages is disabled; do not
delete it early.

## Vercel

Project `nseldeib-projects/nadia-website` (`prj_EzNt39XJCeE1ktBeXhCrnNrUGqFi`)
is created and linked. `DATABASE_URL` and `CUSTOMERIO_SEND_TOKEN` are set for
production and preview. A preview deploy builds green.

### `.vercelignore` — why it exists

The production build shipped 37 routes: `/`, `/api/contact`, and 35 codeyam
scaffolding routes. Those scaffolding routes each carried a
`NODE_ENV === 'production'` → `notFound()` guard, so they were never *reachable*
— but they were still compiled as serverless functions. `.vercelignore` now
excludes them so they are never uploaded and never built. Production is three
routes: `/`, `/_not-found`, `/api/contact`.

The files stay in the repo, so the local dev server and
`codeyam-editor-dev editor probe-isolation-routes` are unaffected. This is
deploy config only — no application source changed.

It also excludes `.env`/`.env.*`. `.vercelignore` does NOT inherit `.gitignore`,
and the first deploy of this session uploaded the real Neon and Customer.io
secrets into the build context before this was added. They were exposed only
within the user's own Vercel account; the user was told and can rotate.

### Two `package.json` fixes were required to deploy at all

  - `build` is now `prisma generate && next build`. Prisma 7 generates into
    `node_modules/@prisma/client`, which Vercel does not restore — without this
    the first deploy failed with `TS2305: Module '@prisma/client' has no
    exported member 'PrismaClient'`. It passed locally only because the
    generated client already existed on disk.
  - `postinstall` is now `[ -n "$VERCEL" ] || playwright install chromium`. It
    was downloading a full headless Chrome into every production build.

## Remaining sequence

1. `vercel deploy --prod` → verify at `nadia-website-ten.vercel.app`
2. Exercise the contact form against the deployed instance (see caveat below)
3. Move nseldeib.com from `v0-placeholder-website-concept` to `nadia-website`
4. User reviews the real thing
5. Merge `rebuild-nextjs` → `main`
6. Add nadiaeldeib.com in Vercel; change DNS at Squarespace; verify
7. Disable GitHub Pages; delete the root `CNAME`

## Carried-forward caveats

  - The codeyam preview cannot reach the database: the editor injects
    `PGHOST=127.0.0.1 PGPORT=14252` but nothing listens on 14252, so in-preview
    form submissions hang for 60s. Unrelated to deployment; verify the form
    against the deployed instance instead.
  - Customer.io: the working send credential is the `sa_sandbox_*`
    service-account token as `CUSTOMERIO_SEND_TOKEN`. The Stripe-provisioned
    `NADIA_MAIL_SITE_ID` / `NADIA_MAIL_API_KEY` are Track API credentials and
    are rejected by the send endpoint.
  - `@codeyam/cms` is an Astro integration. This site is Next.js. Do not
    install it if content-editing comes up; re-research first.
