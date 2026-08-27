import { describe, it, expect, vi, afterEach } from 'vitest';
import { submitMessage } from './submitMessage';

const values = {
  topic: 'hello',
  name: 'Dana',
  email: 'dana@example.com',
  body: 'Hello there.',
  company: '',
};

function mockFetch(impl: () => Promise<unknown> | never) {
  const fn = vi.fn(impl as never);
  vi.stubGlobal('fetch', fn);
  return fn;
}
const json = (status: number, body: unknown) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

afterEach(() => vi.unstubAllGlobals());

describe('submitMessage', () => {
  // The happy path. A 201 is the only signal the form uses to swap itself for
  // the confirmation, so it must not be conflated with anything else.
  it('reports sent on a 2xx', async () => {
    mockFetch(async () => json(201, { ok: true, id: 7 }));
    expect(await submitMessage(values, '/')).toEqual({ kind: 'sent' });
  });

  // Field problems come back as a 422 and must reach the form as per-field
  // messages, not as a generic failure that discards them.
  it('surfaces per-field problems from a 422', async () => {
    const problems = { email: 'That email does not look right.' };
    mockFetch(async () => json(422, { error: 'Some fields need a look.', problems }));
    expect(await submitMessage(values, '/')).toEqual({ kind: 'invalid', problems });
  });

  // A 422 with no problems object is a malformed response, not a field error.
  // Treating it as "invalid" would leave the form with nothing to point at.
  it('treats a 422 without problems as a failure', async () => {
    mockFetch(async () => json(422, { error: 'Some fields need a look.' }));
    const r = await submitMessage(values, '/');
    expect(r.kind).toBe('failed');
  });

  // A server error carries its own copy; the form should show that rather
  // than inventing a message.
  it('passes through the server error message on a 500', async () => {
    mockFetch(async () => json(500, { error: 'Something went wrong on my end. Nothing was sent.' }));
    expect(await submitMessage(values, '/')).toEqual({
      kind: 'failed',
      message: 'Something went wrong on my end. Nothing was sent.',
    });
  });

  // An error response with no readable body still has to produce a message,
  // because the form renders one unconditionally on failure.
  it('falls back to a message when the error body is unreadable', async () => {
    mockFetch(async () => ({
      ok: false, status: 500, json: async () => { throw new Error('not json'); },
    }) as unknown as Response);
    const r = await submitMessage(values, '/');
    expect(r.kind).toBe('failed');
    expect(r.kind === 'failed' && r.message.length).toBeGreaterThan(0);
  });

  // A thrown fetch means the request never landed. That is as likely to be
  // the server as the connection, so the copy must not pick a culprit.
  it('reports a failure when fetch throws', async () => {
    mockFetch(async () => { throw new TypeError('Failed to fetch'); });
    const r = await submitMessage(values, '/');
    expect(r.kind).toBe('failed');
    expect(r.kind === 'failed' && r.message).not.toMatch(/offline/i);
  });

  // The request shape is a contract with the route: POST, JSON content type,
  // and sourcePage folded into the body alongside the form values.
  it('POSTs JSON to the contact route with sourcePage attached', async () => {
    const fn = mockFetch(async () => json(201, { ok: true }));
    await submitMessage(values, '/about');
    const [url, init] = fn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/contact');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({ ...values, sourcePage: '/about' });
  });
});
