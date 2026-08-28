# Database

This project uses **Prisma 7 with PostgreSQL**, hosted at [Neon](https://neon.com).

All application code imports from `@/app/lib/prisma` — that is the only file
that constructs a client, so it is the only file that changes if the datastore
changes again.

**There is no local-file fallback.** The app throws at import if `DATABASE_URL`
is unset, rather than silently working against an empty default and looking
like a content bug. Development and production both talk to Postgres; use a
separate Neon **branch** for development so local work never touches the
messages people actually sent.

## Quick Reference

```bash
# Edit your schema
vim prisma/schema.prisma

# Push schema changes (also regenerates Prisma client)
npm run db:push

# Seed demo data
npm run db:seed

# DESTRUCTIVE: drop every table, recreate from the schema, re-seed.
# Check which branch DATABASE_URL points at before running this.
npm run db:drop-and-reseed

# Browse data visually
npx prisma studio
```

## Where Credentials Go

**Real values go in `.env.local`. `.env.example` holds committed placeholders.**

`.gitignore` ignores both `.env` and `.env*.local`, so neither can be
committed by accident — `.env.example` is the only one of the three that is
tracked. `.env.local` is also where codeyam's Home → Setup flow writes the
variables it manages, and where any future third-party secret belongs. One
file, one answer.

| File           | Committed? | What belongs in it                          |
| -------------- | ---------- | ------------------------------------------- |
| `.env.example` | yes        | Placeholders and documentation only         |
| `.env`         | no         | Local overrides                             |
| `.env.local`   | no         | Real connection strings, API keys, secrets  |

`CONTACT_INBOX` is the address contact-form notes are delivered to. It must
never appear in a tracked file: the site deliberately publishes no email
address, and a placeholder in `.env.example` would undo that. Only
`app/lib/sendNotification.ts` reads it, and it is never logged or returned in
an error.

Everything reads both. Next.js loads the cascade natively with `.env.local`
winning; standalone entry points (`prisma.config.ts`, `prisma/seed.ts`,
`vitest.config.ts`) get the same behavior by importing `app/lib/loadEnv.ts`.
Do **not** replace that import with `dotenv/config` — it reads `.env` only,
which produces a working dev server alongside a CLI that insists
`DATABASE_URL is not set`. If you add a new standalone entry point, import
`app/lib/loadEnv` from it too.

## Adding Columns to Existing Tables

When adding a new **required** column to a table that already has data, `db push` will fail because existing rows have no value for the new column. To avoid this:

- **Add a `@default(...)` value** so Prisma can fill existing rows automatically:
  ```prisma
  model Rating {
    userId String @default("anonymous")  // existing rows get "anonymous"
  }
  ```
- Once all rows have real values, you can remove the default if desired.
- **Never use `--force-reset`** — it drops ALL tables and deletes all data.
- Optional columns (`String?`) don't need a default — existing rows get `null`.

## Using the Database

```typescript
import { prisma } from '@/app/lib/prisma';

// In API routes or server components:
const items = await prisma.yourModel.findMany();
const item = await prisma.yourModel.create({ data: { title: 'New item' } });
```

## Writing DB-Backed Integration Tests

To test data functions against a **real** database (not mocks), point the test
at a throwaway Neon **branch**. Under SQLite this used to be a temp file per
test file; with Postgres there is no local file to throw away, so the isolation
comes from branching instead. Branches are copy-on-write and instant, and the
free plan allows ten per project.

Prefer testing pure logic without a database at all — `validateMessage` and
`submitMessage` are already covered that way. Reach for this only when the
behavior under test is genuinely about persistence.

Three rules make this reliable:

1. **Set `process.env.DATABASE_URL` _before_ importing the Prisma client.**
   `app/lib/prisma.ts` reads `DATABASE_URL` at module-load time, so the client
   must be imported *dynamically*, after the env var is set. It now throws when
   the variable is missing, so an import ordered wrongly fails loudly instead of
   quietly binding to the wrong database.
2. **Create the schema with `prisma db push --url "<branch-url>"`.** The `--url`
   override targets the branch. Do **NOT** pass `--skip-generate` — that flag
   does not exist for `db push` in Prisma 7 and the command fails.
3. **Never suppress the push output** (`stdio: 'ignore'`). Capture it with
   `stdio: 'pipe'` and rethrow on failure, so a broken schema push reports its
   real Prisma error instead of an opaque `beforeAll` throw.

```typescript
import { beforeAll, afterAll, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';

let prisma: typeof import('@/app/lib/prisma').prisma;

beforeAll(async () => {
  // A dedicated branch, never the one holding real messages. Create it with
  // `neonctl branches create`, or set TEST_DATABASE_URL in .env.local.
  const dbUrl = process.env.TEST_DATABASE_URL;
  if (!dbUrl) throw new Error('TEST_DATABASE_URL is not set — refusing to run against the default database.');

  // Rule 1: point the client at the branch BEFORE it is imported.
  process.env.DATABASE_URL = dbUrl;

  // Rule 2 + 3: --url override (no --skip-generate), and capture output so a
  // failed push surfaces its real cause instead of a silent beforeAll throw.
  try {
    execFileSync('npx', ['prisma', 'db', 'push', '--url', dbUrl], {
      stdio: 'pipe',
    });
  } catch (err) {
    const e = err as { stderr?: Buffer; stdout?: Buffer };
    throw new Error(
      `prisma db push failed:\n${e.stderr?.toString() ?? ''}${e.stdout?.toString() ?? ''}`,
    );
  }

  // Rule 1: dynamic import AFTER DATABASE_URL is set.
  ({ prisma } = await import('@/app/lib/prisma'));
});

afterAll(async () => {
  await prisma?.$disconnect();
});

it('reads and writes against the test branch', async () => {
  await prisma.message.deleteMany();
  await prisma.message.create({
    data: { topic: 'consulting', name: 'A', email: 'a@example.com', body: 'hello' },
  });
  expect(await prisma.message.findMany()).toHaveLength(1);
});
```

The branch named by `TEST_DATABASE_URL` is the only thing touched — the
default database is never read or written, which is why the guard at the top
of `beforeAll` refuses to run without that variable rather than falling back.

## Important: Do NOT Change These Settings

- **Generator must be `prisma-client-js`** (not `prisma-client`). The `prisma-client` generator requires a custom output path that breaks Turbopack.
- **Do NOT add an `output` field** to the generator.
- **Do NOT add `url` to the datasource block** in `schema.prisma`. Prisma 7 moved the URL to `prisma.config.ts`.
- **Keep `serverExternalPackages: ["pg"]`** in `next.config.ts`. `pg` opens real sockets and resolves internals at run time; bundled, it fails only once a query is issued.
- **Keep `turbopack: { root: "." }`** in `next.config.ts`.
- **Always run `npx prisma generate`** after `npx prisma db push` (or use `npm run db:push` which does both).

## Where the Hosted Database Lives

Neon, provisioned through Stripe Projects. `stripe projects status` lists it;
`stripe projects env --pull` writes the credentials locally. The connection
string is also in the Neon dashboard.

The variable is `DATABASE_URL`, and it belongs in `.env.local` — see "Where
Credentials Go" above. Nothing outside that file should ever hold the real
string.

### Branches, not files

Neon branches are instant copy-on-write clones, each with its own connection
string. Use them where a file-backed setup would use separate files:

- the **default branch** holds real messages people have sent;
- a **development branch** backs local work and scenario captures;
- a **test branch** backs any DB-backed integration test.

The free plan allows ten branches per project, so there is no reason to share
one. Pointing local development at the default branch is how real messages get
destroyed by a `db:drop-and-reseed` typo.

### If the datastore changes again

`app/lib/prisma.ts` is the only file that constructs a client for the app, and
`prisma/seed.ts` and `.codeyam/seed-adapter.ts` each construct their own
because they run outside Next.js. Those three files, plus the `provider` line
in `schema.prisma`, the adapter package, and `serverExternalPackages` in
`next.config.ts`, are the entire surface. Application code — API routes,
server components, the schema models themselves — does not change.

## Writing Seed Scripts

Seed scripts run outside of Next.js, so they must create their own PrismaClient with the adapter (they cannot import from `@/app/lib/prisma`). See `prisma/seed.ts` for the correct pattern.
