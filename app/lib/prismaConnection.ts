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
  return connectionString;
}
