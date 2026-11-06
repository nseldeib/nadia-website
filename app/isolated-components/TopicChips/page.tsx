import Harness from "./Harness";

/** The closed set of reasons someone might be writing. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Default" } = await searchParams;
  if (s !== "Default" && s !== "LastSelected") {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <Harness />
    </div>
  );
}
