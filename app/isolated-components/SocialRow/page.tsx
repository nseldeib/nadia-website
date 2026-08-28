import Component from "../../../components/contact/SocialRow";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const socials = site.contact.findMe.socials;

const scenarios: Record<string, Props> = {
  // An ordinary row: brand mark and name left, handle right.
  Default: { social: socials[0] },
  // The longest handle in the set, where the two halves come closest to meeting.
  LongHandle: {
    social: socials.find((s) => s.handle.length >= 16) ?? socials[1],
  },
  // A service with no glyph: the row keeps its layout and simply loses the mark.
  NoIcon: {
    social: { href: "https://example.com", name: "Tumblr", handle: "@nseldeib" },
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
    <div id="codeyam-capture"><ul style={{ width: 460, listStyle: "none", margin: 0, padding: 0 }}>
      <Component {...props} />
    </ul></div>
  );
}
