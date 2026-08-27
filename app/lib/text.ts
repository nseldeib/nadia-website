/** Split a sentence around the first occurrence of `brand`, for linkifying it. */
export function splitOnBrand(
  text: string,
  brand: string,
): { before: string; after: string; found: boolean } {
  const i = brand ? text.indexOf(brand) : -1;
  if (i === -1) return { before: text, after: '', found: false };
  return { before: text.slice(0, i), after: text.slice(i + brand.length), found: true };
}
