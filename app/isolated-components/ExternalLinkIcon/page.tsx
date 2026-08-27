import Component from "../../../components/writing/ExternalLinkIcon";

/** The arrow that marks a link as leaving the site. It takes no props. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Default" } = await searchParams;
  if (s !== "Default") {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <Component />
    </div>
  );
}
