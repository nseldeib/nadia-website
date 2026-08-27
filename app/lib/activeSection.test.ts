import { describe, it, expect } from 'vitest';
import { pickActive } from './activeSection';

const ORDER = ['work', 'about', 'writing', 'adventures', 'elsewhere', 'contact'];

describe('pickActive', () => {
  // Nothing crosses the band while the hero fills the screen, and the nav
  // indicator is meant to be absent there rather than guessing at a section.
  it('is null when nothing is visible', () => {
    expect(pickActive(ORDER, new Set())).toBeNull();
  });

  // The ordinary case: exactly one section crosses the band.
  it('returns the one visible section', () => {
    expect(pickActive(ORDER, new Set(['writing']))).toBe('writing');
  });

  // Sections are contiguous, so during a scroll two can briefly both report
  // visible. Document order breaks the tie, which keeps the indicator moving
  // forward instead of flickering back and forth.
  it('prefers the earliest in document order when several are visible', () => {
    expect(pickActive(ORDER, new Set(['elsewhere', 'about', 'writing']))).toBe('about');
  });

  // Observer callbacks arrive in whatever order the browser batches them, so
  // the answer must not depend on insertion order of the visible set.
  it('does not depend on the order ids were added to the set', () => {
    const a = pickActive(ORDER, new Set(['contact', 'work']));
    const b = pickActive(ORDER, new Set(['work', 'contact']));
    expect(a).toBe('work');
    expect(b).toBe('work');
  });

  // A stale id left in the set by a removed section must not win, or the nav
  // would highlight something that is no longer on the page.
  it('ignores ids that are not in the ordered list', () => {
    expect(pickActive(ORDER, new Set(['ghost']))).toBeNull();
    expect(pickActive(ORDER, new Set(['ghost', 'contact']))).toBe('contact');
  });

  // The contact section is last and is a real target, so the final entry must
  // be reachable rather than dropping off the end.
  it('can return the last section', () => {
    expect(pickActive(ORDER, new Set(['contact']))).toBe('contact');
  });

  // An empty order is the pre-hydration case: no sections found in the DOM yet.
  it('is null when there is no ordered list', () => {
    expect(pickActive([], new Set(['work']))).toBeNull();
  });
});
