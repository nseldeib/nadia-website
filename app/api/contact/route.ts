import { prisma } from '@/app/lib/prisma';
import { sendNotification } from '@/app/lib/sendNotification';
import { validateMessage } from '@/app/lib/validateMessage';
import { isHoneypotTripped, readJsonBody } from '@/app/lib/contactRequest';
import { deliverAndStamp } from '@/app/lib/deliverAndStamp';
import {
  couldNotSave,
  needsAnotherLook,
  saved as savedResponse,
  silentlyAccepted,
  unreadableRequest,
} from '@/app/lib/contactResponses';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.ok) return unreadableRequest();

  if (isHoneypotTripped(body.payload)) return silentlyAccepted();

  const result = validateMessage(body.payload);
  if (!result.ok) return needsAnotherLook(result.problems);

  // Write first, mail second. If the mail provider is down the row still
  // exists with emailedAt null, so the message is recoverable rather than lost.
  let saved;
  try {
    saved = await prisma.message.create({ data: result.value });
  } catch (err) {
    console.error('[contact] could not save message', err);
    return couldNotSave();
  }

  // Best-effort and never fails the request: the note is already safe. The
  // stamping rule lives in deliverAndStamp, which is where it is tested.
  await deliverAndStamp(saved, {
    send: sendNotification,
    stamp: (id) => prisma.message.update({ where: { id }, data: { emailedAt: new Date() } }),
    onProblem: (outcome, detail) =>
      console.error(`[contact] ${outcome}, id=`, saved.id, detail),
  });

  return savedResponse(saved.id);
}
