import { FooterSignoff as Component } from "../../../components/Footer";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The real signoff, with the brand linked inside the authored sentence.
  Default: { text: site.footer.signoff, href: site.footer.signoffHref },
  // The linked case stated literally, so the brand is unambiguously a link.
  Linked: { text: "Built with CodeYam and love.", href: "https://codeyam.com" },
  // No href: the brand still reads as part of the sentence, just unlinked.
  Unlinked: { text: site.footer.signoff },
  // The brand edited out entirely. The sentence must still render whole
  // rather than silently losing its second half.
  NoBrand: { text: "Built by hand in New York City.", href: "https://codeyam.com" },
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
