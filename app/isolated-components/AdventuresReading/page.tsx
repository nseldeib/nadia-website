import Component from "../../../components/AdventuresReading";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const reading = site.adventures.reading ?? { label: "", links: [] };

const scenarios: Record<string, Props> = {
  // The real footnote under the Adventures prose: the label over all four
  // running essays, each an internal link that opens in the same tab.
  Default: reading,
  // One essay, to check the label and list hold their rhythm without siblings.
  Single: { ...reading, links: reading.links.slice(0, 1) },
  // Titles long enough to wrap in the text column, to check each row stays
  // one ruled item and the wrapped line keeps its spacing.
  LongTitles: {
    label: reading.label,
    links: [
      {
        slug: "racetoberfest-reflection-four-races",
        title:
          "Racetoberfest Reflection: Four Races in Five Weekends, Two Personal Bests, and One Very Muddy Trail Half I Will Never Forget",
      },
      {
        slug: "on-stubbornness-trail-running-and",
        title: "On Stubbornness, Trail Running, and Learning When Not to Quit Even When Every Mile Says Otherwise",
      },
    ],
  },
};

/**
 * 458px is the Adventures text column at full desktop width: the 1040px wrap
 * (1120 minus 2 × 40 padding) less the 56px gap, split 1 : 1.15 with the photo.
 */
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
    <div id="codeyam-capture"><div style={{ width: 458 }}>
      <Component {...props} />
    </div></div>
  );
}
