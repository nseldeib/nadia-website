# nadiaeldeib.com

Nadia Eldeib's personal site: work, writing, adventures, and a way to get in touch.

One Next.js route. All copy and photography live in `content/site.json`, so a wording
change is a content diff rather than a code diff. The only datastore is the `Message`
table behind the contact form — there is deliberately no email address anywhere on
the site, so the form is the way in.

## Setup

Requires Node 20 or newer. Run the setup script to install dependencies, initialize
the database, and seed it:

```bash
npm run setup
```

A fresh clone works end to end with `git clone` → `npm run setup` → `npm run dev`.

## Development

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using CodeYam Editor

This project was built with [CodeYam](https://codeyam.com). To launch the editor:

```bash
codeyam editor
```

The editor provides a live preview alongside a Claude Code terminal for iterating on the app.

## Content

Copy and photography are data, not markup. `content/site.json` holds every section's
words, links, and image references; `content/site.ts` types it. Editing the site's
text means editing that file — no component changes.

## Database

This project uses Postgres via Prisma, hosted at Neon. The single `Message` model
stores notes sent through the contact form. A row is written before delivery is
attempted, so a message survives a mail outage with `emailedAt` left null rather
than being lost.

`DATABASE_URL` has no local fallback — the app throws at startup without it. See
DATABASE.md for where the connection string goes.

Common commands:

```bash
npm run db:push            # Apply schema changes and generate Prisma client
npm run db:seed            # Seed the database with demo data
npm run db:drop-and-reseed # DESTRUCTIVE: drop every table, recreate, re-seed
```

## Scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run setup`    | One-line project setup (install + db + seed) |
| `npm run dev`      | Start the development server                 |
| `npm run build`    | Build for production                         |
| `npm run test`     | Run tests                                    |
| `npm run db:push`  | Apply Prisma schema changes                  |
| `npm run db:seed`  | Seed the database                            |
| `npm run db:drop-and-reseed` | **Destructive.** Drops every table, then re-seeds |

<!-- codeyam:run-and-edit:start -->
## Develop this project with codeyam-editor

This project is built with [codeyam-editor](https://codeyam.com) — code and runnable data scenarios are authored side by side against a live preview.

```bash
# Install codeyam-editor
npm install -g @codeyam-editor/codeyam-editor@latest

# Launch the editor (split-screen terminal + live preview)
codeyam-editor start
```
<!-- codeyam:run-and-edit:end -->

<!-- codeyam:scenario-gallery:start -->
## Scenario gallery

States captured as runnable scenarios with codeyam-editor:

### Home - Full page

<img src=".codeyam/scenarios/screenshots/home-full-page--desktop.png" alt="Home - Full page" width="280">
<!-- codeyam:scenario-gallery:end -->
