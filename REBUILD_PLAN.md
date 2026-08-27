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

### 1. Swap SQLite for Postgres — DONE

The datastore is Postgres on Neon. `schema.prisma` declares `postgresql`,
`@prisma/adapter-pg` replaced the better-sqlite3 adapter in all three places
that construct a client (`app/lib/prisma.ts`, `prisma/seed.ts`,
`.codeyam/seed-adapter.ts`), and `next.config.ts` externalises `pg`.

Two changes worth knowing about, because they are not reversible by editing a
connection string:

- **There is no local-file fallback.** A missing `DATABASE_URL` now throws at
  import rather than quietly binding to `dev.db`. Development uses a Neon
  branch, not a file, so working offline is no longer possible.
- **`db:reset` is now `db:drop-and-reseed`.** The old name hid a `rm -f dev.db`
  whose Postgres equivalent drops every table in the database. Renamed so that
  running it against the wrong branch requires having read what it does.

### 2. Wire email delivery — DONE

`app/lib/sendNotification.ts` sends the note and the route stamps `emailedAt`
only once the provider accepts it. The try/catch is unchanged in spirit:
delivery still never fails the request, and a row with `emailedAt` null is
still the durable record that something arrived but did not send.

`sendNotification` never throws and never logs the destination address —
`CONTACT_INBOX` is read there and nowhere else, so the inbox cannot leak
through an error message or a stack trace.

The provider is **Customer.io**, not Resend. Resend is not in the Stripe
Projects catalog, and provisioning through Projects was the deciding factor:
the credentials land in `.env` from
`stripe projects add customerio/builder:sandbox` rather than being pasted in
by hand. The cost is the sandbox tier's limit — it delivers only to recipients
verified in the Customer.io workspace, which is fine for one inbox and would
not be for anything wider.

Still needed before this does anything: verify the destination address in the
Customer.io workspace, and set `CONTACT_INBOX` (plus `CONTACT_FROM`, and
`CUSTOMERIO_REGION=eu` only if the workspace is European) in `.env.local`.
The `CUSTOMERIO_*` keys are already in `.env`, written by Projects.

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

**Check which Neon branch `DATABASE_URL` names before running anything
destructive.** The old hazard here was a `DATABASE_URL` pointed at the editor's
own SQLite file; that one is gone with SQLite itself, and the replacement is
blunter. `npm run db:drop-and-reseed` drops every table in whatever database
the variable resolves to, and against the default branch that means the real
messages people have sent. Development and captures belong on their own
branches — see DATABASE.md, "Branches, not files".

Scenario capture additionally needs `DATABASE_URL_codeyam_capture` to already
exist: the sandbox serves the capture database rather than the project's own,
and it cannot create a server-shaped database itself.
