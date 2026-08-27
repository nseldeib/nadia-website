import Component from "../../../components/work/WorkLinkList";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Every link shows its destination, so the target is never a surprise.
  Default: { links: site.work.links },
  // One link, to check the list does not rely on siblings for its rhythm.
  Single: { links: site.work.links.slice(0, 1) },
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
