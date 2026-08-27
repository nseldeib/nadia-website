import Component from "../../../components/hero/TypedHeadline";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The real headline. Step counts derive from each line, so the words matter.
  Default: { lines: site.hero.headline },
  // One short line, checking the cursor lands on the text edge and not past it.
  ShortLine: { lines: ["Building CodeYam."] },
  // Three lines, to see the per-line stagger accumulate rather than fire together.
  Many: {
    lines: ["Founding, running,", "and other", "adventures."],
  },
  // No lines at all. Nothing should render and nothing should throw — this is
  // what a headline emptied out of the content file would look like.
  Empty: { lines: [] },
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
