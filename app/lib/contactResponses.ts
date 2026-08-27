// The contact endpoint's replies, in one place.
//
// Every status code this route can return is named here, so the handler reads
// as intent rather than as five hand-built `NextResponse.json` calls with the
// status buried in an options object. The wording is user-facing copy and
// belongs together for the same reason the site's other copy does.

import { NextResponse } from 'next/server';
import type { Problems } from './validateMessage';

/** The body could not be parsed at all. */
export const unreadableRequest = () =>
  NextResponse.json({ error: 'Could not read that request.' }, { status: 400 });

/**
 * The honeypot was filled in.
 *
 * Deliberately indistinguishable from success. Telling a bot it was detected
 * only teaches whoever wrote it to leave the field alone next time — so this
 * is a 200 with the same shape a real submission gets, and nothing is saved.
 */
export const silentlyAccepted = () => NextResponse.json({ ok: true }, { status: 200 });

/** Validation failed; the per-field problems go back so the form can show them. */
export const needsAnotherLook = (problems: Problems) =>
  NextResponse.json({ error: 'Some fields need a look.', problems }, { status: 422 });

/**
 * The note could not be saved.
 *
 * "Nothing was sent" is literally true here and matters: the sender should
 * retry rather than assume it arrived.
 */
export const couldNotSave = () =>
  NextResponse.json(
    { error: 'Something went wrong on my end. Nothing was sent.' },
    { status: 500 },
  );

/**
 * The note is saved. 201 regardless of whether the email went out, because the
 * row exists either way and delivery is not the sender's problem.
 */
export const saved = (id: number) => NextResponse.json({ ok: true, id }, { status: 201 });
