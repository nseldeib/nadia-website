/**
 * Validation for an inbound contact message.
 *
 * Kept apart from the route so the rules can be exercised directly: the route
 * owns transport and persistence, this owns what counts as a sendable note.
 */

import site from '@/content/site';

// Derived from the content file rather than restated here. Stating the list
// twice is what let the form's default chip ("consulting") drift out of the
// allow-list, so the default selection was rejected as an invalid topic.
export const TOPICS: readonly string[] = site.contact.form.topics.map((t) => t.id);
export type Topic = string;

export const LIMITS = { name: 120, email: 200, body: 5000 };

export type Problems = Partial<Record<'topic' | 'name' | 'email' | 'body', string>>;

export type ValidMessage = {
  topic: string;
  name: string;
  email: string;
  body: string;
  sourcePage: string | null;
};

export type Result =
  | { ok: true; problems: Problems; value: ValidMessage }
  | { ok: false; problems: Problems; value: null };

/** Coerce an untrusted JSON value to a trimmed string; anything else is empty. */
export function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export function validateMessage(payload: unknown): Result {
  const p = (payload ?? {}) as Record<string, unknown>;
  const source = typeof p === 'object' ? p : {};

  const topic = str(source.topic);
  const name = str(source.name);
  const email = str(source.email);
  const body = str(source.body);
  const sourcePage = str(source.sourcePage) || null;

  const problems: Problems = {};

  if (!TOPICS.includes(topic)) {
    problems.topic = 'Pick what this is about.';
  }

  if (!name) problems.name = 'Add your name so I know who I am replying to.';
  else if (name.length > LIMITS.name) problems.name = 'That name is too long.';

  // Deliberately permissive: the only thing worth rejecting is an address that
  // cannot be replied to at all. Clever patterns reject real addresses.
  if (!email) problems.email = 'Add an email so I can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    problems.email = 'That email does not look right.';
  } else if (email.length > LIMITS.email) problems.email = 'That email is too long.';

  if (!body) problems.body = 'Add a note.';
  else if (body.length > LIMITS.body) problems.body = 'That note is too long.';

  if (Object.keys(problems).length) return { ok: false, problems, value: null };
  return { ok: true, problems, value: { topic, name, email, body, sourcePage } };
}
