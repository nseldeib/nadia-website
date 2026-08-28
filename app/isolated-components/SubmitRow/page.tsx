import Component from "../../../components/contact/SubmitRow";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const { form, findMe } = site.contact;

const scenarios: Record<string, Props> = {
  // At rest: the button beside the city and timezone it is sent into.
  Default: { label: form.submit, place: findMe.place, sending: false },
  // Mid-send. The button is disabled so a second press cannot double-submit.
  Sending: { label: form.submit, place: findMe.place, sending: true },
  // No place authored, so the row is the button alone and reserves no gap.
  NoPlace: { label: form.submit, place: [], sending: false },
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
