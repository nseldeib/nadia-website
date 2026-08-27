// Reading an untrusted contact-form request.
//
// Both of these are decisions about the INBOUND request, distinct from
// validating a message or persisting one. They live here so the route reads as
// a sequence of named steps rather than inlining a try/catch and a cast.

import { str } from './validateMessage';

export type JsonBodyResult = { ok: true; payload: unknown } | { ok: false };

/**
 * Parse the request body, without deciding what to do about a failure.
 *
 * A result rather than a thrown error or a `NextResponse`, so the parsing has
 * no opinion about HTTP — that belongs to the caller, and keeping it out means
 * this is testable with a plain `Request`.
 */
export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  try {
    return { ok: true, payload: await request.json() };
  } catch {
    return { ok: false };
  }
}

/**
 * Did the honeypot field come back filled in?
 *
 * `company` is rendered but hidden, so a human never fills it and a bot that
 * fills every field does. Reused rather than re-cast at the call site: the
 * unknown-payload narrowing is exactly the sort of thing that gets subtly
 * wrong when written twice.
 */
export function isHoneypotTripped(payload: unknown): boolean {
  return Boolean(str((payload as { company?: unknown } | null)?.company));
}
