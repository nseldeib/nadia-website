import Component from "../../../components/elsewhere/ElsewhereRow";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // An ordinary row: kind, title, venue, year.
  Default: { row: site.elsewhere.rows[0] },
  // A row carrying a second home, which renders the extra IMDb link.
  WithSecondLink: {
    row: site.elsewhere.rows.find((r) => r.secondHref) ?? site.elsewhere.rows[0],
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
    <div id="codeyam-capture"><div style={{ width: 860 }}>
      <Component {...props} />
    </div></div>
  );
}
