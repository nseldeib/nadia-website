import Component from "../../../components/contact/SentConfirmation";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Replaces the form on success, which also makes a duplicate send impossible.
  Default: { reply: site.contact.form.reply },
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
    <div id="codeyam-capture"><div style={{ width: 620 }}>
      <Component {...props} />
    </div></div>
  );
}
