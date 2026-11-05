import Component from "../../../components/writing/PostList";
import type { ComponentProps } from "react";
import type { PostSummary } from "@/app/lib/posts";

type Props = ComponentProps<typeof Component>;

/**
 * Real posts from the Substack, so the row widths and date column are exercised
 * against titles that actually exist rather than invented ones of convenient
 * length. Dates are constructed in UTC to match how the component formats them.
 */
const post = (slug: string, title: string, iso: string): PostSummary => ({
  slug,
  title,
  subtitle: null,
  publishedAt: new Date(iso),
  canonicalUrl: `https://blog.nseldeib.com/p/${slug}`,
});

const RECENT: PostSummary[] = [
  post("applying-to-the-south-park-commons", "Applying to the South Park Commons Founder Fellowship: My Experience and Advice", "2026-07-13T16:52:49Z"),
  post("you-can-just-ship-things", "You Can Just Ship Things", "2026-07-06T20:56:20Z"),
  post("what-if-creativity-was-the-constraint", "What If Creativity Was the Constraint?", "2026-06-12T20:27:10Z"),
];

const scenarios: Record<string, Props> = {
  // Three essays, dated so the list reads as a timeline.
  Default: { posts: RECENT },

  // The longest title in the archive beside the shortest. The date column is
  // fixed-width, so this is where a long title either wraps cleanly or pushes
  // the arrow out of alignment.
  LongTitle: { posts: [RECENT[0], RECENT[1]] },

  // Nothing stored yet. The component renders nothing at all rather than an
  // empty bordered list, which is why this scenario is worth capturing.
  Empty: { posts: [] },
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
