import { describe, it, expect } from 'vitest';
import {
  couldNotSave,
  needsAnotherLook,
  saved,
  silentlyAccepted,
  unreadableRequest,
} from './contactResponses';

describe('contactResponses', () => {
  // Unparseable input is the client's problem, not a server fault. A 500 here
  // would tell the sender to try again later when the request will never work.
  it('answers unreadable input with 400', async () => {
    const res = unreadableRequest();
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Could not read that request.' });
  });

  // The honeypot reply must be INDISTINGUISHABLE from a real success: same
  // status, same body shape. Any difference tells whoever wrote the bot which
  // field gave them away, and they simply stop filling it in next time.
  it('answers a tripped honeypot exactly like a success', async () => {
    const res = silentlyAccepted();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  // 422 rather than 400: the request was understood, the contents were not
  // acceptable. The per-field problems have to survive so the form can point
  // at the field that needs fixing instead of showing a generic failure.
  it('returns the field problems with a 422', async () => {
    const res = needsAnotherLook({ email: 'That email does not look right.' });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: 'Some fields need a look.',
      problems: { email: 'That email does not look right.' },
    });
  });

  // "Nothing was sent" is literally true when the write failed, and it matters:
  // it tells the sender to retry rather than assume the note arrived.
  it('says nothing was sent when the write failed', async () => {
    const res = couldNotSave();
    expect(res.status).toBe(500);
    expect((await res.json()).error).toContain('Nothing was sent.');
  });

  // 201 regardless of whether the email went out — the row exists either way,
  // and delivery is not the sender's problem. The id goes back so a follow-up
  // can reference the note.
  it('reports the saved row with a 201', async () => {
    const res = saved(42);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true, id: 42 });
  });
});
