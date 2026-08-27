import { describe, it, expect } from 'vitest';
import { validateMessage, str, TOPICS, LIMITS } from './validateMessage';

const valid = {
  topic: 'hello',
  name: 'Dana Whitlock',
  email: 'dana@example.com',
  body: 'Saw the CodeYam demo and wanted to say hello.',
};

describe('str', () => {
  // Surrounding whitespace is the difference between a name and a name with a
  // stray paste, so the coercion has to trim before anything else sees it.
  it('trims a string', () => expect(str('  hi  ')).toBe('hi'));

  // JSON from the wire is untrusted: a number, a null, or an object where a
  // string belongs must collapse to empty rather than reach a length check.
  it('returns empty for a non-string', () => {
    expect(str(undefined)).toBe('');
    expect(str(null)).toBe('');
    expect(str(42)).toBe('');
    expect(str({})).toBe('');
  });
});

describe('validateMessage', () => {
  // The baseline: an ordinary note passes clean and hands back the parsed
  // value, which is what the route persists.
  it('accepts a well-formed message', () => {
    const r = validateMessage(valid);
    expect(r.problems).toEqual({});
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ ...valid, sourcePage: null });
  });

  // Trimming has to happen before validation, not after, or a padded name
  // both passes the empty check and gets stored with its padding.
  it('trims every field before validating', () => {
    const r = validateMessage({ ...valid, name: '  Dana Whitlock  ' });
    expect(r.value?.name).toBe('Dana Whitlock');
  });

  // Topic is a closed set backing the form's chips. Anything outside it is a
  // forged payload, and an empty topic is the unset case.
  it('accepts every listed topic and rejects anything else', () => {
    for (const topic of TOPICS) {
      expect(validateMessage({ ...valid, topic }).problems.topic).toBeUndefined();
    }
    expect(validateMessage({ ...valid, topic: 'other' }).problems.topic).toBeDefined();
    expect(validateMessage({ ...valid, topic: '' }).problems.topic).toBeDefined();
  });

  // A note with no name or no reply address cannot be answered, which is the
  // only thing this form exists to make possible.
  it('requires a name, an email, and a body', () => {
    expect(validateMessage({ ...valid, name: '' }).problems.name).toBeDefined();
    expect(validateMessage({ ...valid, email: '' }).problems.email).toBeDefined();
    expect(validateMessage({ ...valid, body: '' }).problems.body).toBeDefined();
  });

  // Spaces and newlines are not content. Without this, a field holding only
  // whitespace passes the truthiness check and stores as blank.
  it('treats whitespace-only input as missing', () => {
    expect(validateMessage({ ...valid, name: '   ' }).problems.name).toBeDefined();
    expect(validateMessage({ ...valid, body: '\n\t ' }).problems.body).toBeDefined();
  });

  // The one thing worth rejecting is an address that cannot receive a reply:
  // no @, nothing either side of it, or a domain with no dot.
  it('rejects an address with no @ or no dotted domain', () => {
    for (const email of ['dana', 'dana@', '@example.com', 'dana@example', 'a b@c.com']) {
      expect(validateMessage({ ...valid, email }).problems.email).toBeDefined();
    }
  });

  // Deliberately permissive. Plus-addressing, apostrophes, and subdomains are
  // all real addresses that a clever pattern would turn away.
  it('accepts addresses a stricter pattern would wrongly reject', () => {
    for (const email of ['d+tag@example.co.uk', "o'brien@example.com", 'a_b-c@sub.example.io']) {
      expect(validateMessage({ ...valid, email }).problems.email).toBeUndefined();
    }
  });

  // The limits guard the column widths. Checking the boundary both ways proves
  // the comparison is not off by one and does not reject a legitimate maximum.
  it('enforces the length limits', () => {
    expect(validateMessage({ ...valid, name: 'a'.repeat(LIMITS.name + 1) }).problems.name).toBeDefined();
    expect(validateMessage({ ...valid, name: 'a'.repeat(LIMITS.name) }).problems.name).toBeUndefined();
    expect(validateMessage({ ...valid, email: `${'a'.repeat(LIMITS.email)}@example.com` }).problems.email).toBeDefined();
    expect(validateMessage({ ...valid, body: 'a'.repeat(LIMITS.body + 1) }).problems.body).toBeDefined();
    expect(validateMessage({ ...valid, body: 'a'.repeat(LIMITS.body) }).problems.body).toBeUndefined();
  });

  // The form marks every bad field at once. Bailing on the first problem would
  // walk someone through their mistakes one reload at a time.
  it('reports every problem at once, not just the first', () => {
    const r = validateMessage({ topic: 'nope', name: '', email: 'bad', body: '' });
    expect(Object.keys(r.problems).sort()).toEqual(['body', 'email', 'name', 'topic']);
    expect(r.ok).toBe(false);
    expect(r.value).toBeNull();
  });

  // sourcePage is optional context for triage, so it passes through when sent
  // and becomes an explicit null rather than undefined when it is not.
  it('carries sourcePage through, or null when absent', () => {
    expect(validateMessage({ ...valid, sourcePage: '/' }).value?.sourcePage).toBe('/');
    expect(validateMessage(valid).value?.sourcePage).toBeNull();
  });

  // A body that is not an object at all must fail as invalid input rather than
  // throwing, so the route can answer 422 instead of 500.
  it('survives a non-object payload', () => {
    expect(validateMessage(null).ok).toBe(false);
    expect(validateMessage(undefined).ok).toBe(false);
    expect(validateMessage('nope').ok).toBe(false);
  });
});

describe('the topic allow-list and the form agree', () => {
  // The regression this file exists to prevent: the allow-list was written out
  // by hand and drifted from the chips, so the form's own default selection
  // ("Working together") came back 422 and the note could not be sent.
  it('accepts every topic the form actually offers', async () => {
    const site = (await import('@/content/site')).default;
    const offered = site.contact.form.topics;
    expect(offered.length).toBeGreaterThan(0);
    for (const t of offered) {
      const r = validateMessage({
        topic: t.id,
        name: 'Dana',
        email: 'dana@example.com',
        body: 'Hello.',
      });
      expect(r.problems.topic, `chip "${t.label}" (id ${t.id}) was rejected`).toBeUndefined();
    }
  });

  // The default is what someone sends if they never touch the chips, so it has
  // to be valid even more surely than the rest.
  it('accepts the chip the form selects by default', async () => {
    const site = (await import('@/content/site')).default;
    const first = site.contact.form.topics[0];
    const r = validateMessage({
      topic: first.id,
      name: 'Dana',
      email: 'dana@example.com',
      body: 'Hello.',
    });
    expect(r.ok).toBe(true);
  });
});
