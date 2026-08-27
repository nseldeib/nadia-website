import Harness from "./Harness";

/**
 * The honeypot. It is hidden from people by design, so the capture is expected
 * to be visually empty — that emptiness IS the assertion: if this ever shows up
 * in a scenario, it is showing up for real visitors too.
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
      <Harness />
    </div>
  );
}
