import Component from "../../../components/contact/SocialRow";
import type { ComponentProps } from "react";
import site from "@/content/site";
import styles from "../../../components/Contact.module.css";

type Props = ComponentProps<typeof Component>;

const socials = site.contact.findMe.socials;

// The longest handle in the set, excluding the Default row: socials[0] is
// itself long, and picking it made LongHandle render the same frame as Default.
const longestHandle = socials
  .slice(1)
  .reduce((a, b) => (b.handle.length > a.handle.length ? b : a));

const scenarios: Record<string, Props> = {
  // An ordinary row: brand mark and name left, handle right.
  Default: { social: socials[0] },
  // The longest handle in the set, where the two halves come closest to meeting.
  LongHandle: { social: longestHandle },
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
  // The row's layout — the anchor's left/right split, its padding, the rule
  // beneath it — is written as `.socials a` / `.socials li`, so it only applies
  // beneath the list FindMe renders. A plain `<ul>` with inline `listStyle`
  // hid the bullet but left the rest behind, so the row captured as a run of
  // inline text with no split and no rule. It uses the real class instead, and
  // overrides only the two-column track: the section pairs rows across two
  // columns, and a single isolated row should occupy the width of one.
  return (
    <div id="codeyam-capture">
      <ul className={styles.socials} style={{ width: 460, gridTemplateColumns: "1fr", margin: 0 }}>
        <Component {...props} />
      </ul>
    </div>
  );
}
