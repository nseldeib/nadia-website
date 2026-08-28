import { FooterPlace as Component } from "../../../components/Footer";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The real line: city and timezone joined by a middot.
  Default: { place: site.contact.findMe.place },
  // City only. The middot belongs between two parts, so a single part must not
  // trail one.
  CityOnly: { place: ["New York City"] },
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
