// Delivery of a contact-form note to my own inbox.
//
// This module is deliberately the only place that knows an inbox address
// exists. It is read from the environment and never returned, logged, or
// included in an error message: the site must not reveal where notes land,
// and an address that only lives in one module cannot leak from the others.
//
// Delivery goes through Customer.io's transactional API
// (POST /v1/send/email), authenticated with the sandbox service-account token
// Stripe Projects provisions — NOT an "App API key", and not the
// `SITE_ID`/`API_KEY` pair alongside it. Those are Track API credentials: they
// authenticate against track.customer.io and are rejected here.
//
// The token is exposed under a stable name the app owns:
//     stripe projects variables set customerio-send-token \
//       --env-key CUSTOMERIO_SEND_TOKEN --value <the NADIA_MAIL_SA_TOKEN value>
// so this module never has to know the resource-derived `NADIA_MAIL_*` prefix,
// which changes with the `--name` a resource was provisioned under.
//
// Two sandbox-tier limits, both enforced at send time rather than at startup:
// it only delivers to recipients verified in the workspace, and it only sends
// FROM the workspace's assigned `*.customerio.build` domain. A CONTACT_FROM on
// an unverified domain is rejected even though nothing about it looks wrong.

/** What the caller needs to know: it went, or it did not and why. */
export type DeliveryResult = { ok: true } | { ok: false; reason: string };

/** The parts of a saved message that belong in the notification. */
export type NotifiableMessage = {
  id: number;
  topic: string;
  name: string;
  email: string;
  body: string;
  sourcePage: string | null;
};

/**
 * The note, as plain text.
 *
 * Plain text rather than HTML because the whole audience is one person, and
 * a text part is what survives every client without a rendering question.
 * The sender's own words go last and unwrapped, so a long message is not
 * pushed below a wall of metadata.
 */
export function composeBody(message: NotifiableMessage): string {
  const lines = [
    `From: ${message.name} <${message.email}>`,
    `Topic: ${message.topic}`,
  ];
  if (message.sourcePage) lines.push(`Sent from: ${message.sourcePage}`);
  lines.push(`Message #${message.id}`, '', message.body);
  return lines.join('\n');
}

/** Minimal escaping so a note containing `<` or `&` cannot alter the markup. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Customer.io's regional hosts are separate deployments; a key issued in one
 * is rejected by the other. US is the default, and CUSTOMERIO_REGION=eu opts
 * into the European host rather than making every deployment declare it.
 */
export function sendUrl(
  env: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const host =
    env.CUSTOMERIO_REGION?.toLowerCase() === 'eu'
      ? 'https://api-eu.customer.io'
      : 'https://api.customer.io';
  return `${host}/v1/send/email`;
}

/** Everything the send needs from the environment, once it is known complete. */
export type MailConfig = { token: string; to: string; from: string };

export type MailConfigResult =
  | { ok: true; config: MailConfig }
  | { ok: false; missing: string[] };

/**
 * Read the three variables a send requires.
 *
 * Separate from sending because "not configured" is a different situation from
 * "the provider rejected it", and only this one is the operator's own doing.
 * It reports WHICH variables are absent and never their values — `to` in
 * particular is the address this module exists to keep out of logs.
 */
export function readMailConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
): MailConfigResult {
  const token = env.CUSTOMERIO_SEND_TOKEN;
  const to = env.CONTACT_INBOX;
  const from = env.CONTACT_FROM;

  if (!token || !to || !from) {
    return {
      ok: false,
      missing: [
        !token && 'CUSTOMERIO_SEND_TOKEN',
        !to && 'CONTACT_INBOX',
        !from && 'CONTACT_FROM',
      ].filter((n): n is string => typeof n === 'string'),
    };
  }
  return { ok: true, config: { token, to, from } };
}

/**
 * The Customer.io wire format.
 *
 * Its own function because it is the part most likely to change if the
 * provider ever does, and because being pure makes the details assertable —
 * that `reply_to` is the sender rather than the inbox is the kind of thing
 * that breaks silently and is only noticed when someone hits reply.
 */
export function buildSendPayload(message: NotifiableMessage, config: MailConfig) {
  const text = composeBody(message);
  return {
    to: config.to,
    from: config.from,
    subject: `${message.topic} — ${message.name}`,
    // `body` is what Customer.io renders; `plaintext_body` is the text
    // alternative. The HTML part is a <pre> so the line breaks composed above
    // survive a client that prefers HTML.
    body: `<pre style="font:inherit;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
    plaintext_body: text,
    // Identifies the recipient as a person in the workspace. The sandbox tier
    // will only deliver to one that has been verified there.
    identifiers: { email: config.to },
    // So replying in the mail client answers the person who wrote in, rather
    // than the site's own sending address.
    reply_to: message.email,
  };
}

/**
 * Turn a rejected response into something an operator can act on.
 *
 * The provider's own text is the difference between "the token is wrong" and
 * "that recipient is not verified" — both are things only a human can fix, and
 * a bare status code names neither. Truncated because it lands in a log line.
 */
export async function describeSendFailure(res: {
  status: number;
  text: () => Promise<string>;
}): Promise<string> {
  const detail = await res.text().catch(() => '');
  return `customer.io returned ${res.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`;
}

/**
 * Send one notification.
 *
 * Never throws. A delivery failure is an ordinary outcome here — the row is
 * already saved by the time this runs — so the caller gets a result to record
 * rather than an exception to handle. Configuration that is missing entirely
 * is reported the same way, because a site deployed without mail credentials
 * should still accept notes rather than reject them at the form.
 */
export async function sendNotification(
  message: NotifiableMessage,
): Promise<DeliveryResult> {
  const configured = readMailConfig();
  if (!configured.ok) {
    return {
      ok: false,
      reason: `mail is not configured: ${configured.missing.join(', ')} unset`,
    };
  }

  try {
    const res = await fetch(sendUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${configured.config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildSendPayload(message, configured.config)),
    });

    if (!res.ok) return { ok: false, reason: await describeSendFailure(res) };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'unknown send failure' };
  }
}
