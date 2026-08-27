import Component from "../../../components/contact/FindMe";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The profiles and where she is, sharing the section with the form.
  Default: {
    heading: site.contact.findMe.heading,
    socials: site.contact.findMe.socials,
    place: site.contact.findMe.place,
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
