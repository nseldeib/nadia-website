# Feature Patterns

When the feature you're building involves any of the patterns below, **read this
before writing code**. These patterns are designed for this project's Postgres
dev environment and upgrade cleanly to production services later.

This site has no authentication and no user accounts. The only Prisma model is
`Message`, written by the contact form. If a feature ever needs sign-in, it
starts from nothing — there is no auth abstraction here to extend, and the
scaffold's auth guides were removed once it was clear this site would never
grow one.

## External Services (payments, email, maps, weather APIs, etc.)

If the user has dev/test credentials (e.g., Stripe test keys):

- Add them to the `env` block of your editor config. Secret values (API keys, tokens) go in `.codeyam/editor.local.json` (gitignored); non-secret defaults can go in `.codeyam/editor.json`. `editor.local.json` is overlaid on top of `editor.json`, so a secret there wins.
- Restart the dev server — the `env` table is applied to the dev-server process, so the values land in `process.env`

If no credentials are available:

- Build with real API calls in the code
- Mock responses per scenario using `mocks.http` with absolute URL keys (e.g. `"POST https://api.stripe.com/v1/charges"`) in scenario registration (Step 10). There is no separate `externalApis` field — local and external endpoints go in the same `mocks.http` map.

## File Storage / Uploads

For local prototyping, store files in the `public/uploads/` directory and serve them as static assets. Use `fs.writeFile` in API routes. For production, swap to S3/Cloudflare R2/Supabase Storage.

## Images & External Media

Prefer Unsplash (`https://images.unsplash.com/photo-<id>?w=800&q=80`) for realistic seed-data images — semantic relevance matters when scenarios double as visual documentation.

- When a specific Unsplash photo ID returns `ERR_BLOCKED_BY_ORB` or 404 during scenario verification, swap **just that photo ID** to a different Unsplash photo on the same subject. Do not bulk-replace the set — the other URLs are almost certainly fine.
- If a scenario needs a guaranteed-available image (e.g., long-lived stored data that can't be re-generated), download the image once into `public/images/` and reference it locally.
- Last resort: a tagged placeholder service (`https://loremflickr.com/<w>/<h>/<tag>`). These return random matches and degrade visual quality; only use when Unsplash is unavailable for the whole subject. Never hand-write loremflickr URLs — always generate them through the `codeyam-editor editor loremflickr-url` helper to use vetted, single-word tags with strict `match=all` and pinned `lock=<n>` parameters.

## Email / Notifications

For prototyping, log emails to the console or write them to a `/api/dev/sent-emails` endpoint that stores in the database. For production, swap to Resend/SendGrid/Postmark.

---

_This list will grow as new patterns are added. Each pattern follows the same principle: build with a simple local implementation, upgrade to a production service later by swapping one file._
