import { describe, it, expect } from 'vitest';
import { describeError } from './describeError';

describe('describeError', () => {
  // A real Error's message is the most useful thing to put in a sync report.
  it('uses the message of an Error', () => {
    expect(describeError(new Error('feed timed out'), 'fallback')).toBe('feed timed out');
  });

  // Thrown strings and objects carry no reliable message, so the caller's
  // fallback names what failed instead.
  it('falls back for a non-Error value', () => {
    expect(describeError('nope', 'backfill failed')).toBe('backfill failed');
    expect(describeError(undefined, 'backfill failed')).toBe('backfill failed');
  });

  // An Error with an empty message would leave the report field blank, which
  // reads as success.
  it('falls back for an Error with an empty message', () => {
    expect(describeError(new Error(''), 'reconcile failed')).toBe('reconcile failed');
  });
});
