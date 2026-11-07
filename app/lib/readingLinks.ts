/** One essay the Adventures section points to, as authored in site.json. */
export type ReadingEntry = { slug: string; title: string };

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
