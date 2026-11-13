import Component from "../../../components/writing/PostBody";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;
const WIDTH = 1280;

// Already-sanitized HTML, the only shape that reaches this component: the
// essay tag vocabulary (headings, lists, quote, code).
const HTML = [
  "<p>Most of what I have learned about shipping came from doing it badly first. This is a short account of what changed.</p>",
  "<h2>Start smaller than feels reasonable</h2>",
  "<p>The first version should embarrass you a little. <strong>If it does not</strong>, you waited <em>too long</em>.</p>",
  "<ul><li>Pick one user.</li><li>Pick one problem.</li><li>Ship by Friday.</li></ul>",
  "<blockquote><p>You can just ship things.</p></blockquote>",
  "<h3>A note on tools</h3>",
  // No <a> here: links inside injected HTML are never hydrated by React, and
  // the capture check reads an un-hydrated link as a broken page.
  "<p>The tools matter less than the loop. Read more <code>on the newsletter</code>.</p>",
  "<pre><code>npm run dev</code></pre>",
  "<hr /><p>Thanks for reading.</p>",
].join("");

const scenarios: Record<string, Props> = {
  Default: { html: HTML },
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
