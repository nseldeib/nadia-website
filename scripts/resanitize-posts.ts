// One-time (and safely repeatable) re-clean of every stored post body.
//
// Run with: npm run posts:resanitize
//
// Post bodies are sanitized on the way IN, so a fix to `sanitizePostHtml` only
// reaches posts that get written again. The feed sync rewrites posts still in
// the RSS feed and the backfill only creates posts that are missing — so a post
// stored before a sanitizer fix, that has since aged out of the feed, keeps the
// old markup forever. (The case that prompted this: external links once lost
// their `target`/`rel` attributes.)
//
// This re-runs the CURRENT sanitizer over each stored body and writes back only
// the rows whose output differs. Nothing is refetched from Substack. Running it
// a second time changes nothing.
//
// Check which database DATABASE_URL points at first (see DATABASE.md).

import '../app/lib/loadEnv';
import { prisma } from '../app/lib/prisma';
import { postsNeedingResanitize, resanitizeReport } from '../app/lib/resanitizePosts';

// `--dry-run` reports which posts would change without writing anything — a
// safe look at a production database before the real run.
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const posts = await prisma.post.findMany({ select: { id: true, slug: true, bodyHtml: true } });
  const changed = postsNeedingResanitize(posts);

  if (!dryRun) {
    for (const post of changed) {
      await prisma.post.update({ where: { id: post.id }, data: { bodyHtml: post.bodyHtml } });
    }
  }

  const slugs = changed.map((post) => post.slug);
  for (const line of resanitizeReport(slugs, posts.length, dryRun)) console.log(line);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
