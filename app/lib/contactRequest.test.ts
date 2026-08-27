import { describe, it, expect } from 'vitest';
import { isHoneypotTripped, readJsonBody } from './contactRequest';

const post = (body: string) =>
  new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

describe('readJsonBody', () => {
  // The ordinary path: a well-formed submission must reach the route as a
  // payload it can hand to validation.
  it('returns the parsed payload for valid JSON', async () => {
    expect(await readJsonBody(post('{"topic":"hello"}'))).toEqual({
      ok: true,
      payload: { topic: 'hello' },
    });
  });

  // The endpoint is public, so malformed input is an expected arrival, not an
  // exceptional one. It must come back as a result the route can answer with a
  // 400 rather than as a thrown error that would surface as a 500.
  it('reports failure instead of throwing on malformed JSON', async () => {
    await expect(readJsonBody(post('not json at all'))).resolves.toEqual({ ok: false });
  });

  // An empty body is the same class of problem and must take the same path.
  it('reports failure on an empty body', async () => {
    await expect(readJsonBody(post(''))).resolves.toEqual({ ok: false });
  });

  // A bare JSON value parses fine. Deciding it is not a usable message is
  // validation's job, not parsing's — conflating the two would answer 400
  // where the form expects a 422 with field problems.
  it('accepts valid JSON that is not an object', async () => {
    expect(await readJsonBody(post('null'))).toEqual({ ok: true, payload: null });
  });
});

describe('isHoneypotTripped', () => {
  // `company` is rendered but hidden: a human never fills it, a bot that fills
  // every field does.
  it('trips when the hidden field has content', () => {
    expect(isHoneypotTripped({ company: 'Acme Corp' })).toBe(true);
  });

  // The common case, and the one that must never regress: a real submission
  // that leaves the hidden field alone has to pass straight through.
  it('does not trip for an ordinary submission', () => {
    expect(isHoneypotTripped({ topic: 'hello', name: 'Ada' })).toBe(false);
  });

  // Whitespace is not content. A stray space injected by an autofill would
  // otherwise silently discard a real person's message — the worst failure
  // this endpoint has, because the sender is told it succeeded.
  it('does not trip on whitespace alone', () => {
    expect(isHoneypotTripped({ company: '   ' })).toBe(false);
  });

  // The payload is untrusted, so every shape has to be survivable rather than
  // throwing before validation ever runs.
  it('survives payloads that are not objects', () => {
    expect(isHoneypotTripped(null)).toBe(false);
    expect(isHoneypotTripped(undefined)).toBe(false);
    expect(isHoneypotTripped('a string')).toBe(false);
    expect(isHoneypotTripped({ company: 42 })).toBe(false);
  });
});
