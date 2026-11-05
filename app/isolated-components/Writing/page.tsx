import Component from "../../../components/Writing";
import type { PostSummary } from "@/app/lib/posts";

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

const scenarios: Record<string, { posts: PostSummary[] }> = {
  // The section as a visitor meets it: three recent essays, the way through to
  // the archive, and the newsletter CTA.
  Default: { posts: RECENT },

  // Production's day-one state. The list and the archive link both disappear —
  // what remains is the lede explaining what she writes about and the one way
  // to read it. This is the scenario that proves the section degrades to
  // something worth reading rather than to an empty rule.
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
    <div id="codeyam-capture">
      <Component {...props} />
    </div>
  );
}
