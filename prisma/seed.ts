// Seed script for populating the database with demo data.
//
// Run `npx prisma generate` before this script if Prisma client is missing.
// `prisma db push` does NOT auto-generate the client.
//
// Run with: npx tsx prisma/seed.ts
// Or:       npm run db:seed
//
// The connection-string guard is shared with app/lib/prisma.ts via
// `app/lib/prismaConnection.ts`, so the two cannot drift. Note Prisma 7
// requires the adapter — `new PrismaClient()` on its own will not work.

// Loads the full dotenv cascade (`.env.local` wins over `.env`), matching
// what Next.js and codeyam do. Plain `dotenv/config` would read `.env` only
// and miss the credentials codeyam writes. Must come before any env read.
import '../app/lib/loadEnv';
import { readFileSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { requireConnectionString } from '../app/lib/prismaConnection';
import { type SeedMessage, type SeedPost, seedTable, summarize, toMessageRow, toSeedPostRow } from './seedRows';

const adapter = new PrismaPg({ connectionString: requireConnectionString() });
const prisma = new PrismaClient({ adapter });

/**
 * The received-messages world.
 *
 * Read from the same file the scenario captures use, so a local database and a
 * captured screenshot are looking at identical data. A second copy of these
 * rows inline here is how the two would quietly drift apart.
 */
const SEED_FILE = path.join(__dirname, '..', '.codeyam', 'seed-data', 'messages-received.json');

/**
 * The essays the Adventures section links to, stored as real (sanitized)
 * Substack posts so those links open a page locally instead of a 404. The same
 * file seeds the homepage scenarios.
 */
const ESSAYS_FILE = path.join(__dirname, '..', '.codeyam', 'seed-data', 'running-essays.json');

/**
 * One table's rows from a seed file. The files are optional: a clone that only
 * wants a running site does not need the demo inbox or the essays, and an
 * empty table is a valid state.
 */
function readSeedFile<T>(file: string, table: string): T[] {
  try {
    return seedTable<T>(JSON.parse(readFileSync(file, 'utf8')), table);
  } catch {
    return [];
  }
}

async function seedEssays() {
  const essays = readSeedFile<SeedPost>(ESSAYS_FILE, 'Post');
  // Upsert, not replace: a local Post table may also hold posts the feed sync
  // wrote, and those must survive a re-seed.
  for (const essay of essays) {
    const row = toSeedPostRow(essay);
    await prisma.post.upsert({ where: { slug: row.slug }, create: row, update: row });
  }
  console.log(`Seeded ${essays.length} linked essay(s).`);
}

async function main() {
  await seedEssays();

  const messages = readSeedFile<SeedMessage>(SEED_FILE, 'Message');

  if (!messages.length) {
    console.log(
      `No seed messages found at ${path.relative(process.cwd(), SEED_FILE)} — leaving the database empty.`,
    );
    return;
  }

  // Replace rather than append, so re-running does not stack duplicates.
  await prisma.message.deleteMany({});
  await prisma.message.createMany({ data: messages.map(toMessageRow) });

  console.log(summarize(messages));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
