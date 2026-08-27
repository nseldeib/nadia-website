import type { Problems } from './validateMessage';

export type SubmitResult =
  | { kind: 'sent' }
  | { kind: 'invalid'; problems: Problems }
  | { kind: 'failed'; message: string };

/**
 * Send the contact form and classify what came back.
 *
 * Three outcomes, because the form does three different things: swap itself
 * for a confirmation, mark individual fields, or keep the draft and offer the
 * profiles as another route. Nothing typed is ever cleared on a failure.
 */
export async function submitMessage(
  values: Record<string, string>,
  sourcePage: string,
): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, sourcePage }),
    });
  } catch {
    // The request never landed. As likely my end as their connection, so the
    // copy does not pick a culprit.
    return { kind: 'failed', message: 'That did not send. It may be my end or your connection.' };
  }

  if (res.ok) return { kind: 'sent' };

  const data = await res.json().catch(() => ({}) as Record<string, unknown>);
  if (res.status === 422 && data.problems) {
    return { kind: 'invalid', problems: data.problems as Problems };
  }
  return {
    kind: 'failed',
    message: (data.error as string) ?? 'Something went wrong sending that.',
  };
}
