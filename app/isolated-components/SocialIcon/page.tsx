import Component from "../../../components/contact/SocialIcon";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // A known service, drawn in currentColor at the size the row uses.
  Default: { name: "GitHub" },
  // The other five marks, so every glyph in the set is proven to render.
  Substack: { name: "Substack" },
  Instagram: { name: "Instagram" },
  Threads: { name: "Threads" },
  X: { name: "X" },
  LinkedIn: { name: "LinkedIn" },
  // A name with no glyph renders nothing at all. That branch has no scenario
  // of its own because a blank frame cannot be captured — `SocialRow - NoIcon`
  // shows the same case where it actually matters, as a row that keeps its
  // layout and simply loses the mark.
  Unknown: { name: "Tumblr" },
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
  // The glyph sits in an outlined slot the size the row gives it. The frame is
  // scaffolding, not part of the component: it is what makes the Unknown
  // scenario legible, since a name with no glyph renders nothing at all and a
  // wholly blank frame cannot be captured or told apart from a broken page.
  return (
    <div id="codeyam-capture">
      <div
        style={{
          width: 17,
          height: 17,
          color: "#f4efe6",
          outline: "1px dashed rgba(244,239,230,0.35)",
          outlineOffset: 3,
        }}
      >
        <Component {...props} />
      </div>
    </div>
  );
}
