import Component from "../../../components/work/AdvisoryCard";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Closed by default: the offer reads, the scope is one click away.
  Default: {
    label: site.work.advisory.label,
    body: site.work.advisory.body,
    summary: site.work.advisory.summary,
    bullets: site.work.advisory.bullets,
    cta: site.work.advisory.cta,
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
    <div id="codeyam-capture"><div style={{ width: 760 }}>
      <Component {...props} />
    </div></div>
  );
}
