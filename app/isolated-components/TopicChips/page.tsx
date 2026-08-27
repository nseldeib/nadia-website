import site from "@/content/site";
import Harness from "./Harness";

/** The closed set of reasons someone might be writing. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Default" } = await searchParams;
  const { form } = site.contact;

  // Default selects the first chip, the same one the form starts on.
  // LastSelected proves the selected style is not tied to the first position.
  const initial =
    s === "Default"
      ? form.topics[0].id
      : s === "LastSelected"
        ? form.topics[form.topics.length - 1].id
        : null;

  if (initial === null) {
    return <div>Unknown scenario: {s}</div>;
  }

  return (
    <div id="codeyam-capture">
      <div style={{ width: 620 }}>
        <Harness legend={form.topicLabel} topics={form.topics} initial={initial} />
      </div>
    </div>
  );
}
