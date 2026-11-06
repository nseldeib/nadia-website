// One-time (and safely repeatable) fill of the Post table from Substack.
//
// Run with: npm run posts:backfill
//
// Reconciling normally happens when someone visits /writing, under a 2.5s
// deadline — fine for picking up one new post, not for filling an empty table
// with every post Substack has ever published. Run this once against a database
// before the writing routes deploy to it, so the first visitor sees the whole
// archive rather than a partial one. Re-running is harmless: the feed is
// upserted and the backfill only creates posts that are missing.
//
// Check which database DATABASE_URL points at first (see DATABASE.md).

// Loads the full dotenv cascade (`.env.local` wins over `.env`). Must come
// before anything that reads the environment — including the Prisma client.
import '../app/lib/loadEnv';
import { prisma } from '../app/lib/prisma';
import { syncPostsFromFeed } from '../app/lib/posts';

async function main() {
  const result = await syncPostsFromFeed({ force: true });
  const total = await prisma.post.count();

  console.log(JSON.stringify(result, null, 2));
  console.log(`Post table now holds ${total} post(s).`);

  // A failed feed read means nothing was written; say so with the exit code so
  // a deploy step running this does not carry on as if it had worked.
  if (result.failed) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
