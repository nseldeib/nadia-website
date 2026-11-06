import Component from "../../../components/writing/WritingNav";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;
const WIDTH = 1280;

const scenarios: Record<string, Props> = {
  // On /writing: the Writing link is marked as the current page.
  Default: { current: "archive" },
  // On a post: nothing is marked current.
  Post: { current: "post" },
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
    <div id="codeyam-capture"><div style={{ width: WIDTH }}>
      <Component {...props} />
    </div></div>
  );
}
