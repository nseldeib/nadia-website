import Component from "../../../components/SectionHead";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The pairing every section carries. Work is the first one a reader meets.
  Default: { n: site.work.number, eyebrow: site.work.eyebrow },
  // The last section, to prove a two-digit number and a longer word still align.
  Contact: { n: site.contact.number, eyebrow: site.contact.eyebrow },
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
    <div id="codeyam-capture">
      <Component {...props} />
    </div>
  );
}
