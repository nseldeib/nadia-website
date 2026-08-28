import Component from "../../../components/elsewhere/ElsewhereRow";
import type { ComponentProps } from "react";
import site from "@/content/site";
import styles from "../../../components/Elsewhere.module.css";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // An ordinary row: kind, title, venue, year.
  Default: { row: site.elsewhere.rows[0] },
  // The longest title in the set, where the four columns come closest to
  // colliding. (The old WithSecondLink case is gone with the extra IMDb link.)
  LongTitle: {
    row: site.elsewhere.rows.reduce((a, b) => (b.title.length > a.title.length ? b : a)),
  },
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
  // Every rule that lays this row out — the four-column grid, the rules above
  // and below, the suppressed bullet — is written as `.rows li` / `.rows a`,
  // so it only applies beneath the list Elsewhere renders. Isolating the bare
  // `<li>` dropped all of it: the columns collapsed into one run-on line and a
  // list bullet reappeared. The list ancestor is part of the component's
  // contract, so the isolation page supplies it.
  return (
    <div id="codeyam-capture"><div style={{ width: 860 }}>
      <ul className={styles.rows}>
        <Component {...props} />
      </ul>
    </div></div>
  );
}
