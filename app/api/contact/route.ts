import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { str, validateMessage } from '@/app/lib/validateMessage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Could not read that request.' }, { status: 400 });
  }

  // The honeypot is answered silently. Telling a bot it was detected only
  // teaches whoever wrote it to leave the field alone next time.
  if (str((payload as { company?: unknown } | null)?.company)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const result = validateMessage(payload);
  if (!result.ok) {
    return NextResponse.json(
      { error: 'Some fields need a look.', problems: result.problems },
      { status: 422 },
    );
  }

  // Write first, mail second. If the mail provider is down the row still
  // exists with emailedAt null, so the message is recoverable rather than lost.
  let saved;
  try {
    saved = await prisma.message.create({ data: result.value });
  } catch (err) {
    console.error('[contact] could not save message', err);
    return NextResponse.json(
      { error: 'Something went wrong on my end. Nothing was sent.' },
      { status: 500 },
    );
  }

  // Delivery is best-effort and never fails the request: the note is already
  // safe. Wiring Resend here is phase 5 of the build plan.
  try {
    // await sendNotification(saved)
    // await prisma.message.update({ where: { id: saved.id }, data: { emailedAt: new Date() } })
  } catch (err) {
    console.error('[contact] saved but could not email, id=', saved.id, err);
  }

  return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
}
