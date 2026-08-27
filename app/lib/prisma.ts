// Database connection singleton.
// This is the ONLY file that changes when the datastore changes.
// All application code imports from here — API routes, server components, etc.
//
// Usage:
//   import { prisma } from "@/app/lib/prisma";
//   const items = await prisma.yourModel.findMany();
//
// Where the connection string comes from: DATABASE.md.

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { requireConnectionString } from './prismaConnection';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Shared with `prisma/seed.ts` — see `prismaConnection.ts` for why the guard
// lives there rather than being spelled out in both entry points.
const adapter = new PrismaPg({ connectionString: requireConnectionString() });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
