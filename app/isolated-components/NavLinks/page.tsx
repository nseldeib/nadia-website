import { NavLinks as Component } from "../../../components/Nav";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Nothing active: what the bar looks like while the hero fills the screen.
  Default: { active: null },
  // A section in view, showing the number appearing to the left of its label.
  WorkActive: { active: "work" },
  // The last section, so the indicator is proven at the end of the row too.
  ElsewhereActive: { active: "elsewhere" },
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
