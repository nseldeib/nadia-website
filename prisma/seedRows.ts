// Pure transforms for the seed script.
//
// These live apart from `seed.ts` on purpose: that file calls `main()` at
// module scope, so importing it connects to the database and runs a
// `deleteMany`. A test that wanted to check the row mapping would wipe the
// developer's table as a side effect of the import. Nothing here touches a
// database or reads the environment.

export type SeedMessage = {
  topic: string;
  name: string;
  email: string;
  body: string;
  createdAt?: string;
  emailedAt?: string | null;
  sourcePage?: string | null;
};

/**
 * One seed record as a database row.
 *
 * The date handling is the reason this is worth its own function. `createdAt`
 * is left `undefined` when absent so the column default applies, while
 * `emailedAt` is explicitly `null` — those two absences mean different things
 * and must not be collapsed. A null `emailedAt` is the durable record that a
 * note arrived but delivery failed, a state the seed deliberately represents.
 */
export function toMessageRow(m: SeedMessage) {
  return {
    topic: m.topic,
    name: m.name,
    email: m.email,
    body: m.body,
    createdAt: m.createdAt ? new Date(m.createdAt) : undefined,
    emailedAt: m.emailedAt ? new Date(m.emailedAt) : null,
    sourcePage: m.sourcePage ?? null,
  };
}

/** The one-line report, split out so the counting is checkable on its own. */
export function summarize(messages: SeedMessage[]): string {
  const delivered = messages.filter((m) => m.emailedAt).length;
  return `Seeded ${messages.length} message(s): ${delivered} delivered, ${messages.length - delivered} saved but not emailed.`;
}
