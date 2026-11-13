const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  ndash: '–', mdash: '—', hellip: '…',
};

/**
 * Turn HTML character codes (`&#8220;`, `&#x2019;`, `&amp;`) back into the
 * characters they stand for, for text that will be shown as text.
 *
 * Never use this on HTML that is rendered as HTML: decoding `&lt;` there would
 * turn escaped text into markup. A code that is not recognised, or a number
 * that is not a real character, is kept exactly as written.
 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === '#') {
      const hex = code[1] === 'x' || code[1] === 'X';
      const point = hex ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : whole;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? whole;
  });
}

/** Split a sentence around the first occurrence of `brand`, for linkifying it. */
export function splitOnBrand(
  text: string,
  brand: string,
): { before: string; after: string; found: boolean } {
  const i = brand ? text.indexOf(brand) : -1;
  if (i === -1) return { before: text, after: '', found: false };
  return { before: text.slice(0, i), after: text.slice(i + brand.length), found: true };
}
