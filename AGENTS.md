<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- Everything below is hand-maintained. `next dev` only rewrites the marked
     block above, so content here survives its regeneration. -->

# Project docs

Read the one that matches what you're touching:

- **`DATABASE.md`** — Postgres, Prisma, and where the connection string and
  other secrets go. Start here for anything touching `app/lib/prisma.ts` or the
  contact form's stored messages.
- **`FEATURE_PATTERNS.md`** — conventions for external services, file storage,
  seed imagery, and email. Read before adding a feature that reaches outside
  the app.

There is no authentication in this site and no auth documentation; see
`FEATURE_PATTERNS.md` for why.
