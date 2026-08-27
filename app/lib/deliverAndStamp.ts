// What happens to a note after it is safely in the table.
//
// This is the heart of the contact pipeline's semantics, so it is separated
// from both the route (which owns HTTP) and the mailer (which owns transport)
// and takes its collaborators as arguments. That makes all three outcomes
// reachable in a test without a database or a mail provider — the ordering
// rule below is easy to state and easy to break, and nothing else asserts it.

import type { DeliveryResult, NotifiableMessage } from './sendNotification';

/**
 * The three ways this ends. Named rather than void because the difference
 * between them is the whole point, and a caller that logs them needs to tell
 * them apart.
 *
 * - `delivered`            the provider accepted it and the row records that
 * - `not-delivered`        the provider did not accept it; the row stands with
 *                          `emailedAt` null, which is what makes the note
 *                          recoverable instead of lost
 * - `delivered-unstamped`  it went out but the row could not be updated. The
 *                          harmless direction: a note believed unsent that
 *                          actually arrived, never the reverse.
 */
export type DeliveryOutcome = 'delivered' | 'not-delivered' | 'delivered-unstamped';

export type DeliveryDeps = {
  send: (message: NotifiableMessage) => Promise<DeliveryResult>;
  stamp: (id: number) => Promise<unknown>;
  onProblem?: (outcome: Exclude<DeliveryOutcome, 'delivered'>, detail: string) => void;
};

/**
 * Attempt delivery, and record it only if it actually happened.
 *
 * `emailedAt` is what separates "arrived and reached me" from "arrived and is
 * still sitting in the table", so it is stamped strictly AFTER the provider
 * accepts — never before, and never on a failed send. Stamping optimistically
 * would make an undelivered note indistinguishable from a delivered one, and
 * the table is the only record there is.
 *
 * Never throws. The row is already saved by the time this runs, so there is
 * nothing left worth failing the request over.
 */
export async function deliverAndStamp(
  message: NotifiableMessage,
  deps: DeliveryDeps,
): Promise<DeliveryOutcome> {
  const delivery = await deps.send(message);

  if (!delivery.ok) {
    deps.onProblem?.('not-delivered', delivery.reason);
    return 'not-delivered';
  }

  try {
    await deps.stamp(message.id);
    return 'delivered';
  } catch (err) {
    deps.onProblem?.(
      'delivered-unstamped',
      err instanceof Error ? err.message : 'unknown stamping failure',
    );
    return 'delivered-unstamped';
  }
}
