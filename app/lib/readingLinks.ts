/** One essay the Adventures section points to, as authored in site.json. */
export type ReadingEntry = { slug: string; title: string };

/**
 * The authored essay slugs the store does not hold, in authored order. Each
 * one is an Adventures link that would 404 — usually a typo in site.json or a
 * post that was unpublished or made paid on Substack.
 */
export function missingReadingSlugs(entries: ReadingEntry[], stored: Iterable<string>): string[] {
  const have = new Set(stored);
  return entries.map(({ slug }) => slug.trim()).filter((slug) => !have.has(slug));
}

/**
 * The one-line warning naming the essays that will 404, or null when there are
 * none. It points at site.json because the fix is editorial, not a re-run.
 */
export function missingReadingLinksWarning(missing: string[]): string | null {
  if (!missing.length) return null;
  return `Warning: ${missing.length} essay(s) linked from Adventures are not in the Post table and will 404: ${missing.join(', ')}. Check the slugs in content/site.json.`;
}

/**
 * Turns authored `{ slug, title }` entries into the `{ href, label }` shape the
 * ruled link list renders. Hrefs are internal `/writing/<slug>` paths so the
 * essays open on this site, in the same tab, like the homepage writing list.
 * Order is preserved — it is the order the reader sees.
 */
export function toReadingLinks(entries: ReadingEntry[]): { href: string; label: string }[] {
  return entries.map(({ slug, title }) => ({
    href: `/writing/${encodeURIComponent(slug.trim())}`,
    label: title,
  }));
}
