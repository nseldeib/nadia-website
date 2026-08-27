import Component from "../../../components/Hero";

/**
 * Hero reads its copy from the content module, so it takes no props. The
 * single scenario is the real section as the page renders it.
 */
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
