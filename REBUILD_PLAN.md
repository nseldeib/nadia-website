# Rebuild pickup plan

Where the nadiaeldeib.com rebuild stands, and what is left to do. Open this repo
in CodeYam Editor and start at "Next up".

## Where things stand

The Next.js rebuild is merged into this repo on the `rebuild-nextjs` branch.
`main` is untouched and still serves the live site through GitHub Pages.

- **Branch:** `rebuild-nextjs`
- **Merge commit:** `b9e4fe6`, which has two parents, so both histories are one graph
- **Tests:** 36 passing
- **Audit:** clean, 0 findings
- **Scenarios:** 55 component + 1 application, all captured

Verified locally on the merged branch: home `200`, favicon `200`,
`POST /api/contact` `201`, all 17 photographs `200`, every section rendering.

## The original site is preserved

Two independent pointers at `c3aa281`, the last commit of the GitHub Pages site:

| Ref | Kind | Use |
| --- | --- | --- |
| `v1-github-pages` | tag | Immutable marker. `git checkout v1-github-pages` to view it. |
| `v1-original-site` | branch | Same commit, browsable in GitHub's branch UI. |

Nothing was deleted from history. `src/`, `components.json`, and the old
`deploy.yml` are all still reachable through either ref.

## What changed in the merge

Carried over from the original site on purpose:

- `src/app/favicon.ico` moved to `app/favicon.ico`, because the rebuild had none
- `CNAME`, kept for now so Pages can keep serving the live domain from `main`
- the `codeyam-memory`, `codeyam-new-rule`, and `codeyam-setup` agent skills

Dropped on purpose:

- `.github/workflows/deploy.yml`. It builds a static export. The rebuild has an
  API route and a database, so it cannot be exported statically and this
  workflow would fail on every push.
- `src/` and `components.json`, the original site's source and shadcn config,
  both preserved under the refs above.

## Next up

### 1. Swap SQLite for Postgres

This is the blocker for deploying anywhere. Vercel's filesystem is ephemeral, so
a SQLite file cannot persist contact messages there.

- Provision a Postgres database (Vercel Postgres or Neon, both have free tiers)
- Change `datasource db` in `prisma/schema.prisma` from `sqlite` to `postgresql`
- Swap the driver adapter in `app/lib/prisma.ts` and `prisma/seed.ts`
  (`@prisma/adapter-better-sqlite3` becomes the Postgres adapter)
- Put the connection string in `.env.local`, never in `.env`
- `npx prisma db push` against the new database, then `npm run db:seed`

Only the datastore changes. `validateMessage` and the API route are untouched.

### 2. Wire Resend for delivery

`app/api/contact/route.ts` already writes the row first and has the send call
stubbed with a comment. Fill it in and set `emailedAt` on success. Leave the
try/catch as it is: delivery must never fail the request, because the note is
already saved. A row with `emailedAt` null is the durable record that something
arrived but did not send.

### 3. Deploy the branch to Vercel as a preview

Import the repo into Vercel and deploy `rebuild-nextjs`. Vercel gives every
branch its own `*.vercel.app` URL. The live domain is untouched at this point,
so this is a free look at the real thing. Test the contact form against the real
Postgres database here.

### 4. Cut over, in this order

The order is what avoids downtime.

1. Add `nadiaeldeib.com` to the Vercel project. It will say "waiting for DNS".
2. Merge `rebuild-nextjs` into `main`. The Pages workflow is gone, so nothing
   rebuilds — but **Pages keeps serving its last successful build**, so the live
   site stays up.
3. Change DNS at the registrar to the records Vercel shows you. During
   propagation some visitors reach Pages (old site, still working) and some
   reach Vercel (new site). Both work.
4. Once Vercel is serving the domain: disable GitHub Pages in repo settings and
   delete `CNAME`.

To revert at any point: point DNS back at GitHub and re-enable Pages. The old
build is still published, and `v1-github-pages` still has the code.

### 5. Then

- Point `nseldeib.com` at the same site
- Install `@codeyam/cms` so content edits do not need a deploy

## Known issues

- **`preview-verify` is broken in the editor.** The editor process advertises
  `127.0.0.1:14350`, pinned by `open-codeyam.sh`, but binds a different port.
  The value lives in the running process, so no config file reaches it and
  `restart-server` does not clear it. A structural exception is recorded.
  Everything else, including component capture and screenshots, works.
- **3 high-severity npm vulnerabilities** reported at install, inherited from
  the scaffold and never triaged. Run `npm audit` before going live.
- **The state matrix flags `Field`, `FooterSignoff`, and `NavLinks`.** All three
  are analyzer limitations, not real gaps: string-valued props read as booleans,
  and `NavLinks` is blamed for `Nav`'s `solid` state. Each state is covered.

## Watch out for

`.env.example` used to point `DATABASE_URL` at `.codeyam/db.sqlite3`, which is
the *editor's own* database. Running `prisma db push` with that value makes
Prisma try to reshape the editor's tables. It is fixed to `file:./dev.db`, but
if you ever see Prisma offering to drop a `projects` table, that is what
happened — stop and check `DATABASE_URL`.
