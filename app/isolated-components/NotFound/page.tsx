import Component from "../../../components/NotFound";

/**
 * NotFound reads its copy from the content module, so it takes no props. The
 * single scenario is the page exactly as a visitor to a dead URL sees it —
 * there is no empty / loading / error variant to separate out, because the
 * component renders the same three elements unconditionally.
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
