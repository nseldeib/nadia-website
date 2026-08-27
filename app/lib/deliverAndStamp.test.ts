import { describe, it, expect, vi } from 'vitest';
import { deliverAndStamp } from './deliverAndStamp';
import type { NotifiableMessage } from './sendNotification';

const message: NotifiableMessage = {
  id: 7,
  topic: 'hello',
  name: 'Ada',
  email: 'ada@example.com',
  body: 'Saying hello.',
  sourcePage: '/',
};

describe('deliverAndStamp', () => {
  // The ordering rule. `emailedAt` is the only record of whether a note
  // actually reached the inbox, so stamping it for a send that failed would
  // make an undelivered note indistinguishable from a delivered one.
  it('does not stamp when the provider rejects the send', async () => {
    const stamp = vi.fn();
    const outcome = await deliverAndStamp(message, {
      send: async () => ({ ok: false, reason: 'recipient not verified' }),
      stamp,
    });
    expect(outcome).toBe('not-delivered');
    expect(stamp).not.toHaveBeenCalled();
  });

  // The happy path, and the id must be the saved row's — stamping the wrong
  // row would mark someone else's note as delivered.
  it('stamps the saved row once the provider accepts', async () => {
    const stamp = vi.fn(async () => undefined);
    const outcome = await deliverAndStamp(message, {
      send: async () => ({ ok: true }),
      stamp,
    });
    expect(outcome).toBe('delivered');
    expect(stamp).toHaveBeenCalledWith(7);
  });

  // Sending must happen before stamping, not concurrently — if the write were
  // issued first, a provider rejection would leave a false record behind.
  it('sends before it stamps', async () => {
    const order: string[] = [];
    await deliverAndStamp(message, {
      send: async () => {
        order.push('send');
        return { ok: true };
      },
      stamp: async () => {
        order.push('stamp');
      },
    });
    expect(order).toEqual(['send', 'stamp']);
  });

  // A failed stamp after a successful send is the one acceptable inconsistency:
  // the note arrived but the row still reads as undelivered. Better a
  // duplicate-looking row than a message believed sent that never was.
  it('reports delivered-unstamped when the row update fails', async () => {
    const outcome = await deliverAndStamp(message, {
      send: async () => ({ ok: true }),
      stamp: async () => {
        throw new Error('connection lost');
      },
    });
    expect(outcome).toBe('delivered-unstamped');
  });

  // The row is already safe by the time this runs, so nothing here is worth
  // failing the request over. A throw would turn a saved note into a 500 and
  // invite the sender to submit it twice.
  it('never throws, even when stamping blows up', async () => {
    await expect(
      deliverAndStamp(message, {
        send: async () => ({ ok: true }),
        stamp: async () => {
          throw new Error('connection lost');
        },
      }),
    ).resolves.toBeDefined();
  });

  // The operator needs to know which of the two problems occurred, and the
  // provider's own reason is what distinguishes a bad token from an unverified
  // recipient.
  it('reports the provider reason on a failed send', async () => {
    const onProblem = vi.fn();
    await deliverAndStamp(message, {
      send: async () => ({ ok: false, reason: 'recipient not verified' }),
      stamp: async () => undefined,
      onProblem,
    });
    expect(onProblem).toHaveBeenCalledWith('not-delivered', 'recipient not verified');
  });

  // Logging is the caller's business; omitting the hook must not crash the
  // delivery path.
  it('works without an onProblem hook', async () => {
    await expect(
      deliverAndStamp(message, {
        send: async () => ({ ok: false, reason: 'nope' }),
        stamp: async () => undefined,
      }),
    ).resolves.toBe('not-delivered');
  });
});
