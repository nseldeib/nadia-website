import Component from "../../../components/hero/ScrollCue";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Names where it goes rather than saying "scroll".
  Default: { href: "#work", label: site.hero.cueLabel, title: site.hero.cueTitle },
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
