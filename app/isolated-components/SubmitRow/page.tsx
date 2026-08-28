import Component from "../../../components/contact/SubmitRow";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const { form } = site.contact;

const scenarios: Record<string, Props> = {
  // At rest: the button as it waits to be pressed.
  Default: { label: form.submit, reply: form.reply, sending: false },
  // Mid-send. The button is disabled so a second press cannot double-submit.
  Sending: { label: form.submit, reply: form.reply, sending: true },
  // No reply note authored, so the row is the button alone.
  NoReply: { label: form.submit, reply: null, sending: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Default" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture"><div style={{ width: 600 }}>
      <Component {...props} />
    </div></div>
  );
}
