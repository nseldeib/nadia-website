import Component from "../../../components/writing/PostFooter";
import type { ComponentProps } from "react";
import type { PostSummary } from "@/app/lib/posts";

/** Real Substack titles; dates in UTC to match how the components format them. */
const post = (slug: string, title: string, iso: string, subtitle: string | null = null): PostSummary => ({
  slug,
  title,
  subtitle,
  publishedAt: new Date(iso),
  canonicalUrl: `https://blog.nseldeib.com/p/${slug}`,
});

type Props = ComponentProps<typeof Component>;
const WIDTH = 1280;

const CTA = { label: "Subscribe on Substack", href: "https://blog.nseldeib.com/subscribe" };
const OLDER = post("what-if-creativity-was-the-constraint", "What If Creativity Was the Constraint?", "2026-06-12T20:27:10Z");
const NEWER = post("applying-to-the-south-park-commons", "Applying to the South Park Commons Founder Fellowship: My Experience and Advice", "2026-07-13T16:52:49Z");

const scenarios: Record<string, Props> = {
  // A post in the middle of the archive: both neighbours.
  Default: { cta: CTA, previous: OLDER, next: NEWER },
  // The newest post: only an older neighbour.
  Newest: { cta: CTA, previous: OLDER, next: null },
  // The oldest post: the placeholder keeps "Newer" in the right-hand column.
  Oldest: { cta: CTA, previous: null, next: NEWER },
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
    <div id="codeyam-capture"><div style={{ width: WIDTH }}>
      <Component {...props} />
    </div></div>
  );
}
