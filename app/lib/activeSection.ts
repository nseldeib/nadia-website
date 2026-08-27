/**
 * Which section is active, given document order and what is currently visible.
 *
 * Sections are contiguous, so during a scroll two can briefly both cross the
 * band. Document order breaks the tie: the indicator moves forward rather than
 * flickering between neighbours. Kept separate from the observer so the choice
 * can be exercised without a DOM.
 */
export function pickActive(order: string[], visible: Set<string>): string | null {
  return order.find((id) => visible.has(id)) ?? null;
}
