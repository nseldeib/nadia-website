import { describe, it, expect } from 'vitest';
import { decodeEntities, splitOnBrand } from './text';

describe('decodeEntities', () => {
  // The real case that prompted this: Substack's feed sends curly quotes as
  // decimal codes, and without decoding they show on the page verbatim.
  it('decodes decimal character codes', () => {
    expect(decodeEntities('&#8220;You like doing hard things!&#8221;')).toBe('“You like doing hard things!”');
  });

  // Hex codes are the same characters written another way; both cases of the
  // x must work, since HTML accepts either.
  it('decodes hex character codes in either case', () => {
    expect(decodeEntities('it&#x2019;s')).toBe('it’s');
    expect(decodeEntities('it&#X2019;s')).toBe('it’s');
  });

  // Named codes cover the punctuation an essay title actually uses.
  it('decodes the common named codes', () => {
    expect(decodeEntities('Tom &amp; Jerry &mdash; &ldquo;hi&rdquo; &hellip;')).toBe('Tom & Jerry — “hi” …');
    expect(decodeEntities('a&nbsp;b')).toBe('a b');
  });

  // An unrecognised name must survive as written rather than vanish, so an
  // odd code is visible and fixable instead of silently deleting text.
  it('keeps an unknown named code as written', () => {
    expect(decodeEntities('&notarealcode; stays')).toBe('&notarealcode; stays');
  });

  // A number that is not a real character must not throw — a thrown error
  // would cost the whole feed, not one title.
  it('keeps an out-of-range or zero number as written', () => {
    expect(decodeEntities('&#0; and &#99999999;')).toBe('&#0; and &#99999999;');
  });

  // Plain text, a bare ampersand, and an empty string pass through unchanged.
  it('leaves text without codes unchanged', () => {
    expect(decodeEntities('Running Towards (and Past) 35!')).toBe('Running Towards (and Past) 35!');
    expect(decodeEntities('R&D')).toBe('R&D');
    expect(decodeEntities('')).toBe('');
  });

  // Decoding happens once: an escaped ampersand becomes a literal one, not a
  // second round of decoding that would change what the author wrote.
  it('decodes only one level', () => {
    expect(decodeEntities('&amp;#8220;')).toBe('&#8220;');
  });
});

describe('splitOnBrand', () => {
  // The footer signoff is one authored string with the brand inside it. The
  // split is what lets the brand become a link without hard-coding the copy.
  it('splits a sentence around the brand', () => {
    expect(splitOnBrand('Built with CodeYam in New York.', 'CodeYam')).toEqual({
      before: 'Built with ',
      after: ' in New York.',
      found: true,
    });
  });

  // If the copy is ever edited to drop the brand, the whole string must still
  // render — silently losing the signoff would be worse than not linking it.
  it('returns the whole string when the brand is absent', () => {
    expect(splitOnBrand('Built by hand.', 'CodeYam')).toEqual({
      before: 'Built by hand.',
      after: '',
      found: false,
    });
  });

  // Only the first occurrence is linked. Linking the same word twice in one
  // line reads as a mistake, and the second half must keep its text.
  it('splits on the first occurrence only', () => {
    const r = splitOnBrand('CodeYam and CodeYam', 'CodeYam');
    expect(r.before).toBe('');
    expect(r.after).toBe(' and CodeYam');
    expect(r.found).toBe(true);
  });

  // The brand sitting at either end is a real case: no stray empty segment,
  // and the rendered sentence must be byte-identical to the input.
  it('handles the brand at the start or the end', () => {
    expect(splitOnBrand('CodeYam builds it.', 'CodeYam')).toEqual({
      before: '', after: ' builds it.', found: true,
    });
    expect(splitOnBrand('Built with CodeYam', 'CodeYam')).toEqual({
      before: 'Built with ', after: '', found: true,
    });
  });

  // Matching is case-sensitive on purpose: the brand is a proper noun, and
  // linking a lowercase "codeyam" mid-sentence would be wrong.
  it('is case-sensitive', () => {
    expect(splitOnBrand('built with codeyam', 'CodeYam').found).toBe(false);
  });

  // Empty inputs must not throw or produce undefined halves, since the result
  // is spread straight into JSX.
  it('survives empty input', () => {
    expect(splitOnBrand('', 'CodeYam')).toEqual({ before: '', after: '', found: false });
    expect(splitOnBrand('anything', '')).toEqual({ before: 'anything', after: '', found: false });
  });

  // Reassembly is the real invariant: before + brand + after must reproduce
  // the original exactly, or the footer would quietly change her words.
  it('reassembles to the original string', () => {
    const s = 'Built with CodeYam in New York.';
    const { before, after } = splitOnBrand(s, 'CodeYam');
    expect(before + 'CodeYam' + after).toBe(s);
  });
});
