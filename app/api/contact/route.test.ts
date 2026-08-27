import { describe, it, expect, vi, beforeEach } from 'vitest';

// The route's collaborators are mocked so this exercises ORCHESTRATION only —
// what runs, in what order, and what comes back. The pieces themselves are
// tested in their own files; a database or a mail provider here would make the
// interesting failure paths (a rejected send, a failed write) unreachable.
const create = vi.fn();
const update = vi.fn();
const send = vi.fn();

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    message: {
      create: (...a: unknown[]) => create(...a),
      update: (...a: unknown[]) => update(...a),
    },
  },
}));

vi.mock('@/app/lib/sendNotification', () => ({
  sendNotification: (...a: unknown[]) => send(...a),
}));

const { POST } = await import('./route');

const body = {
  topic: 'hello',
  name: 'Ada',
  email: 'ada@example.com',
  body: 'Saying hello.',
  sourcePage: '/',
};

const post = (payload: unknown) =>
  POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: typeof payload === 'string' ? payload : JSON.stringify(payload),
    }),
  );

beforeEach(() => {
  create.mockReset().mockResolvedValue({ id: 1, ...body });
  update.mockReset().mockResolvedValue({});
  send.mockReset().mockResolvedValue({ ok: true });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/contact', () => {
  // The whole point of writing before sending: a mail outage must leave a
  // recoverable row rather than losing the note. So the row is created even
  // when delivery fails, and the sender still gets a success.
  it('saves the note and still returns 201 when delivery fails', async () => {
    send.mockResolvedValue({ ok: false, reason: 'recipient not verified' });
    const res = await post(body);
    expect(res.status).toBe(201);
    expect(create).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
  });

  // The happy path stamps the row, and only after the provider accepted.
  it('stamps emailedAt once delivery succeeds', async () => {
    const res = await post(body);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true, id: 1 });
    expect(update).toHaveBeenCalledOnce();
  });

  // The honeypot must short-circuit BEFORE anything is written, or a bot would
  // fill the table with rows while being told it succeeded.
  it('writes nothing when the honeypot is tripped', async () => {
    const res = await post({ ...body, company: 'Acme' });
    expect(res.status).toBe(200);
    expect(create).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  // Validation runs before persistence: an invalid submission must not reach
  // the database, and the sender needs the per-field problems back.
  it('rejects an invalid submission with 422 and saves nothing', async () => {
    const res = await post({ ...body, email: 'not-an-email' });
    expect(res.status).toBe(422);
    expect((await res.json()).problems).toHaveProperty('email');
    expect(create).not.toHaveBeenCalled();
  });

  // Malformed JSON is a 400, distinct from a 422 — the body was never
  // understood, so there are no field problems to report.
  it('answers malformed JSON with 400', async () => {
    const res = await post('{ not json');
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  // A failed write is the one case where the sender must NOT be told it
  // worked: nothing was saved and nothing was sent, so they should retry.
  it('returns 500 and does not attempt delivery when the write fails', async () => {
    create.mockRejectedValue(new Error('connection refused'));
    const res = await post(body);
    expect(res.status).toBe(500);
    expect(send).not.toHaveBeenCalled();
  });

  // The note is already safe once the row exists, so a stamping failure must
  // not turn a saved note into a 500 that invites a duplicate submission.
  it('still returns 201 when stamping fails after a successful send', async () => {
    update.mockRejectedValue(new Error('connection lost'));
    const res = await post(body);
    expect(res.status).toBe(201);
  });
});
