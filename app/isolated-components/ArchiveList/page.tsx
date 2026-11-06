import Component from "../../../components/writing/ArchiveList";
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
const WIDTH = 860;

const POSTS: PostSummary[] = [
  post("applying-to-the-south-park-commons", "Applying to the South Park Commons Founder Fellowship: My Experience and Advice", "2026-07-13T16:52:49Z", "What the application asks, and what I would tell someone applying next."),
  post("you-can-just-ship-things", "You Can Just Ship Things", "2026-07-06T20:56:20Z"),
  post("what-if-creativity-was-the-constraint", "What If Creativity Was the Constraint?", "2026-06-12T20:27:10Z"),
  post("a-year-of-building", "A Year of Building", "2025-12-30T18:00:00Z", "Looking back on twelve months of shipping."),
  post("first-post", "First Post", "2024-07-24T15:00:00Z"),
];

const scenarios: Record<string, Props> = {
  // Three years, so the year markers and the cuts between runs both show,
  // with and without subtitles.
  Default: { posts: POSTS },
  // A single year: one marker, no cut.
  SingleYear: { posts: POSTS.slice(0, 3) },
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
