import { describe, it, expect } from 'vitest';
import {
  buildSendPayload,
  composeBody,
  describeSendFailure,
  escapeHtml,
  readMailConfig,
  sendUrl,
  type MailConfig,
} from './sendNotification';
import type { NotifiableMessage } from './sendNotification';

const message: NotifiableMessage = {
  id: 12,
  topic: 'consulting',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  body: 'First line.\nSecond line.',
  sourcePage: '/work',
};

const config: MailConfig = {
  token: 'sa_sandbox_test',
  to: 'inbox@example.com',
  from: 'hello@example.customerio.build',
};

describe('readMailConfig', () => {
  // The whole point of reporting missing NAMES is that the values must never
  // be logged — CONTACT_INBOX in particular is the address the site exists to
  // keep unpublished.
  it('names every missing variable without revealing any value', () => {
    const r = readMailConfig({});
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected failure');
    expect(r.missing).toEqual([
      'CUSTOMERIO_SEND_TOKEN',
      'CONTACT_INBOX',
      'CONTACT_FROM',
    ]);
  });

  // A partially-configured deployment is the realistic failure — the operator
  // needs to know WHICH one they forgot, not just that something is wrong.
  it('names only the one that is absent', () => {
    const r = readMailConfig({
      CUSTOMERIO_SEND_TOKEN: 't',
      CONTACT_FROM: 'f',
    });
    if (r.ok) throw new Error('expected failure');
    expect(r.missing).toEqual(['CONTACT_INBOX']);
  });

  // An env file with `CONTACT_INBOX=""` left as a placeholder is unconfigured,
  // not configured-to-empty. Treating it as set would send to nowhere.
  it('treats an empty string as unset', () => {
    const r = readMailConfig({
      CUSTOMERIO_SEND_TOKEN: 't',
      CONTACT_INBOX: '',
      CONTACT_FROM: 'f',
    });
    if (r.ok) throw new Error('expected failure');
    expect(r.missing).toEqual(['CONTACT_INBOX']);
  });

  // The success shape is what the sender destructures, so the three values
  // must come back under the names it expects and unmodified.
  it('returns the config once all three are present', () => {
    const r = readMailConfig({
      CUSTOMERIO_SEND_TOKEN: 'tok',
      CONTACT_INBOX: 'in@example.com',
      CONTACT_FROM: 'out@example.com',
    });
    expect(r).toEqual({
      ok: true,
      config: { token: 'tok', to: 'in@example.com', from: 'out@example.com' },
    });
  });
});

describe('sendUrl', () => {
  // Customer.io's regional hosts are separate deployments and a token issued
  // in one is rejected by the other, so this defaulting is a real failure mode
  // rather than cosmetics.
  it('defaults to the US host', () => {
    expect(sendUrl({})).toBe('https://api.customer.io/v1/send/email');
  });

  // Case-insensitive because the value is hand-typed into an env file, and
  // `EU` failing over to the US host would be a 401 with no obvious cause.
  it('uses the EU host when the region says so, case-insensitively', () => {
    const eu = 'https://api-eu.customer.io/v1/send/email';
    expect(sendUrl({ CUSTOMERIO_REGION: 'eu' })).toBe(eu);
    expect(sendUrl({ CUSTOMERIO_REGION: 'EU' })).toBe(eu);
  });

  // Anything that is not "eu" must fall back to US rather than building a
  // nonsense host out of an unrecognised value.
  it('falls back to US for an unrecognised region', () => {
    expect(sendUrl({ CUSTOMERIO_REGION: 'apac' })).toBe(
      'https://api.customer.io/v1/send/email',
    );
  });
});

describe('composeBody', () => {
  // The sender's own words go last and unwrapped, so a long note is not pushed
  // below a wall of metadata.
  it('puts the metadata first and the message last, verbatim', () => {
    const text = composeBody(message);
    expect(text.startsWith('From: Ada Lovelace <ada@example.com>')).toBe(true);
    expect(text.endsWith('First line.\nSecond line.')).toBe(true);
    expect(text).toContain('Topic: consulting');
    expect(text).toContain('Message #12');
  });

  // sourcePage is optional; an absent one must not leave a dangling label.
  it('omits the source line when there is no source page', () => {
    expect(composeBody({ ...message, sourcePage: null })).not.toContain('Sent from:');
    expect(composeBody(message)).toContain('Sent from: /work');
  });
});

describe('escapeHtml', () => {
  // The note is untrusted input interpolated into the HTML part. Without this
  // a message containing markup would alter the email's structure.
  it('escapes the characters that could alter the markup', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert("x")&lt;/script&gt;',
    );
  });

  // Ampersand must be escaped FIRST or the escapes themselves get re-escaped
  // into `&amp;lt;`, which renders as visible garbage.
  it('does not double-escape its own output', () => {
    expect(escapeHtml('a & b < c')).toBe('a &amp; b &lt; c');
  });
});

describe('buildSendPayload', () => {
  // Replying should answer the person who wrote in, not the site's own sending
  // address. This breaks silently — nobody notices until a reply goes nowhere.
  it('replies to the sender, and delivers to the configured inbox', () => {
    const p = buildSendPayload(message, config);
    expect(p.reply_to).toBe('ada@example.com');
    expect(p.to).toBe('inbox@example.com');
    expect(p.from).toBe('hello@example.customerio.build');
  });

  // The subject is how the inbox is scanned, so both facts belong in it.
  it('puts the topic and the sender in the subject', () => {
    expect(buildSendPayload(message, config).subject).toBe('consulting — Ada Lovelace');
  });

  // Customer.io identifies the recipient as a person in the workspace; on the
  // sandbox tier that identifier is what must be verified for delivery.
  it('identifies the recipient by the inbox address', () => {
    expect(buildSendPayload(message, config).identifiers).toEqual({
      email: 'inbox@example.com',
    });
  });

  // The plain-text part must be the composed note exactly — it is the copy
  // that survives every client.
  it('carries the composed note as the plaintext part', () => {
    expect(buildSendPayload(message, config).plaintext_body).toBe(composeBody(message));
  });

  // The HTML part wraps the same text in a <pre> so the line breaks survive,
  // and the note itself must be escaped on the way in.
  it('escapes the note inside the HTML part', () => {
    const p = buildSendPayload({ ...message, body: '5 < 6 & 7' }, config);
    expect(p.body).toContain('5 &lt; 6 &amp; 7');
    expect(p.body).toContain('<pre');
  });
});

describe('describeSendFailure', () => {
  // A bare status code cannot distinguish a bad token from an unverified
  // recipient, and both are things only the operator can fix.
  it('includes the status and the provider detail', async () => {
    const reason = await describeSendFailure({
      status: 400,
      text: async () => 'recipient not verified',
    });
    expect(reason).toBe('customer.io returned 400: recipient not verified');
  });

  // The reason lands in a log line, so a huge HTML error page must not be
  // pasted into it wholesale.
  it('truncates a long body', async () => {
    const reason = await describeSendFailure({
      status: 500,
      text: async () => 'x'.repeat(1000),
    });
    expect(reason.length).toBeLessThan(360);
  });

  // An empty body must not leave a trailing colon with nothing after it.
  it('omits the separator when there is no detail', async () => {
    expect(await describeSendFailure({ status: 401, text: async () => '' })).toBe(
      'customer.io returned 401',
    );
  });

  // Reading the body can itself fail; the status is still worth reporting and
  // this must not throw into the delivery path, which promises never to throw.
  it('still reports the status when the body cannot be read', async () => {
    expect(
      await describeSendFailure({
        status: 502,
        text: async () => {
          throw new Error('stream closed');
        },
      }),
    ).toBe('customer.io returned 502');
  });
});
