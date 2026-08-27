import Component from "../../../components/work/WorkNarrative";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The prose column: north star first, then what she is building.
  Default: {
    paragraphs: site.work.paragraphs,
    subhead: site.work.subhead,
    links: site.work.links,
    proof: site.work.proof,
  },
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
