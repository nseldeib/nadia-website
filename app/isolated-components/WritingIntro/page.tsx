import Component from "../../../components/writing/WritingIntro";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // What she writes about, and the way through to the rest.
  Default: { lede: site.writing.lede, cta: site.writing.cta },
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
    <div id="codeyam-capture"><div style={{ width: 460 }}>
      <Component {...props} />
    </div></div>
  );
}
