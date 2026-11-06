// The one place that turns an environment into a Postgres connection string.
//
// Two entry points need this and must not drift: `app/lib/prisma.ts` (the
// Next.js singleton) and `prisma/seed.ts` (a standalone script). Until this
// module existed, that agreement was enforced only by a comment at the top of
// the seed script telling the next reader to keep the two in sync — which is
// not enforcement, just a request.
//
// The env is a parameter rather than a direct `process.env` read so the
// failure path can be exercised without mutating global state in a test.

/** The message is the whole value of failing here — it names the fix. */
export const MISSING_DATABASE_URL =
  'DATABASE_URL is not set. The Postgres connection string belongs in `.env.local` — see DATABASE.md.';

/**
 * Read DATABASE_URL, or throw naming where the value belongs.
 *
 * Fail at import rather than at first query. The SQLite adapter this replaced
 * could fall back to `file:./dev.db`, so a missing value still produced a
 * working app; Postgres has no such default, and without this the first
 * symptom is a driver-level error at request time that says nothing about the
 * cause. An empty string is treated as unset — a placeholder left blank in an
 * env file is a missing value, not a configured one.
 */
export function requireConnectionString(
  env: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const connectionString = env.DATABASE_URL;
  if (!connectionString) throw new Error(MISSING_DATABASE_URL);
  return withExplicitPort(connectionString);
}

/** Postgres's standard port — what a connection string without one means. */
export const DEFAULT_POSTGRES_PORT = '5432';

/**
 * The connection string with its port stated, when it left the port out.
 *
 * `pg` fills a missing port from the `PGPORT` environment variable before
 * falling back to 5432. The codeyam editor sets `PGPORT` for its own database
 * proxy, so a port-less Neon URL had the dev server dialling the Neon host on
 * the proxy's port — every query hung, and every page that reads the database
 * hung with it. Stating the default port makes the URL mean the same thing in
 * every environment. A URL that already names a port, or that is not a
 * parseable URL (e.g. multi-host), is returned exactly as given.
 */
export function withExplicitPort(connectionString: string): string {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return connectionString;
  }
  if (url.port || !url.hostname) return connectionString;
  url.port = DEFAULT_POSTGRES_PORT;
  return url.toString();
}
