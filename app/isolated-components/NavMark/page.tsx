import Component from "../../../components/nav/NavMark";

/** The wordmark linking back to the top of the page. It takes no props. */
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
