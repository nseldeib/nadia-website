import { describe, it, expect } from 'vitest';
import { excerptFromHtml, sanitizePostHtml } from './sanitizePostHtml';

describe('sanitizePostHtml', () => {
  // Allowed essay markup passes through unchanged.
  it('keeps the essay vocabulary', () => {
    const html = '<h2>Heading</h2><p>Some <strong>bold</strong> and <em>soft</em> words.</p>';
    expect(sanitizePostHtml(html)).toBe(html);
  });

  // A disallowed tag's TEXT must go too, or "Subscribe" strands mid-essay.
  it('drops Substack subscribe forms and buttons along with their text', () => {
    const html =
      '<p>Before</p><form><input type="email"><button>Subscribe</button></form><p>After</p>';
    const out = sanitizePostHtml(html);

    expect(out).toBe('<p>Before</p><p>After</p>');
    expect(out).not.toContain('Subscribe');
  });

  // Script and Substack's image controls must vanish with their content.
  it('removes scripts and svg controls entirely', () => {
    const out = sanitizePostHtml('<p>Text</p><script>alert(1)</script><svg><path d="M0"/></svg>');
    expect(out).toBe('<p>Text</p>');
  });

  // Layout wrappers go, but the prose inside them stays.
  it('unwraps layout divs but keeps their text', () => {
    expect(sanitizePostHtml('<div class="pencraft pc-x"><p>Kept</p></div>')).toBe('<p>Kept</p>');
  });

  // Substack's pencraft utility classes never reach the page.
  it('strips class attributes from allowed tags', () => {
    expect(sanitizePostHtml('<p class="pencraft">Hi</p>')).toBe('<p>Hi</p>');
  });

  // External links in an essay leave the site and say so.
  it('opens external links in a new tab with a safe rel', () => {
    const out = sanitizePostHtml('<a href="https://example.com">x</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  // mailto and relative links do not get a new-tab target.
  it('leaves non-http links alone', () => {
    expect(sanitizePostHtml('<a href="mailto:a@b.c">x</a>')).toBe('<a href="mailto:a@b.c">x</a>');
  });

  // Only http, https and mailto links survive sanitizing.
  it('drops javascript: hrefs', () => {
    expect(sanitizePostHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript');
  });

  // <picture>/<source> collapse, but the <img> and its srcset survive.
  it('keeps the img from a picture wrapper with its srcset', () => {
    const out = sanitizePostHtml(
      '<picture><source srcset="a.webp"><img src="https://cdn/a.jpg" srcset="https://cdn/a.jpg 1x" alt="A"></picture>',
    );
    expect(out).toBe('<img src="https://cdn/a.jpg" srcset="https://cdn/a.jpg 1x" alt="A" />');
  });
});

describe('excerptFromHtml', () => {
  // A short body becomes plain text with no ellipsis.
  it('returns short text unchanged, without markup', () => {
    expect(excerptFromHtml('<p>Hello <em>world</em></p>')).toBe('Hello world');
  });

  // Stripping tags alone would weld "SPC." onto "The team".
  it('puts a space between blocks so captions do not weld onto paragraphs', () => {
    expect(excerptFromHtml('<figcaption>Image courtesy of SPC.</figcaption><p>The team</p>')).toBe(
      'Image courtesy of SPC. The team',
    );
  });

  // An excerpt never ends mid-word.
  it('cuts long text on a word boundary with an ellipsis', () => {
    const out = excerptFromHtml('<p>alpha beta gamma delta</p>', 13);
    expect(out).toBe('alpha beta…');
  });

  // With no space to cut at, the excerpt still respects the limit.
  it('hard-cuts a single word longer than the limit', () => {
    expect(excerptFromHtml('<p>abcdefghij</p>', 4)).toBe('abcd…');
  });
});
