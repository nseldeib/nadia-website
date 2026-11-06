// Turning a Substack post body into something this site can render.
//
// The feed's `content:encoded` is not article HTML — it is a rendered Substack
// page fragment with Substack's own UI baked in. Measured across the 20 posts
// in the feed: 148 <button>/<svg> pairs (the image expand and restack controls)
// and 25 <form>s carrying 52 <input>s (subscribe boxes), plus `pencraft pc-*`
// utility classes throughout.
//
// So there is no "just embed it" option. Rendering the raw value would put
// Substack's subscribe forms and image controls in the middle of the essay.
//
// Stripping happens on the way IN — the sanitized result is what goes in the
// database — rather than on the way out. One place to be right, and nothing
// downstream has to remember to call this.

import sanitizeHtml from 'sanitize-html';

/**
 * The tags an essay actually needs.
 *
 * Derived from what the feed really contains rather than guessed: paragraphs,
 * second- and third-level headings, lists, links, emphasis, images with
 * captions, block quotes, and code. Everything outside this list is Substack
 * chrome or layout scaffolding that the site's own CSS replaces.
 */
export const ALLOWED_TAGS = [
  'p',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'strong',
  'em',
  'b',
  'i',
  'figure',
  'figcaption',
  'img',
  'br',
  'hr',
  'code',
  'pre',
];

/**
 * Tags whose TEXT must go too, not just their markup.
 *
 * This is the difference between a clean essay and one with the word
 * "Subscribe" stranded mid-paragraph. sanitize-html's default for a disallowed
 * tag is to drop the tag and keep its text, which is right for a stray <div>
 * and wrong for a subscribe form.
 */
export const DROPPED_WITH_CONTENT = [
  'script',
  'style',
  'noscript',
  'form',
  'button',
  'input',
  'textarea',
  'select',
  'option',
  'svg',
  'iframe',
];

/**
 * A post body, reduced to the site's own vocabulary.
 *
 * `<picture>`/`<source>` are not in the allowlist, so Substack's responsive
 * wrappers collapse — but the `<img>` inside is allowed and survives, keeping
 * its own `srcset`. That is deliberate: Substack's CDN already serves correctly
 * sized variants, so the image stays responsive with none of the wrapper.
 */
export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    nonTextTags: DROPPED_WITH_CONTENT,
    allowedAttributes: {
      // `target` and `rel` must be allowed here or the transform below adds
      // them and the attribute filter immediately strips them again.
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'srcset', 'sizes', 'width', 'height'],
    },
    // Substack serves every image from its own CDN over https.
    allowedSchemes: ['http', 'https', 'mailto'],
    // A class attribute is never in the allowlist above, so `pencraft pc-*` and
    // friends are dropped without needing to be named.
    transformTags: {
      // Links out of an essay behave like every other external link on the
      // site: they leave, and they say so.
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.href?.startsWith('http')
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
          : attribs,
      }),
    },
  });
}

/**
 * A plain-text opening for metadata and previews.
 *
 * Descriptions in the feed are short and sometimes absent, so the first prose
 * of the body is the reliable fallback for a page description or a card.
 */
export function excerptFromHtml(html: string, maxChars = 200): string {
  // Block ends become a space FIRST. Stripping tags alone welds the end of a
  // caption onto the start of the next paragraph — "Image courtesy of SPC.The
  // team at South Park Commons…" — which reads as a typo in every preview.
  const spaced = html.replace(/<\/(p|h[1-6]|li|figcaption|blockquote|div|figure)>/gi, ' ');

  const text = sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxChars) return text;

  // Cut on a word boundary so the ellipsis does not land mid-word.
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
