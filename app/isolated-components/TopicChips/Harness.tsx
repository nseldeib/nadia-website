"use client";

import { useState } from "react";
import TopicChips from "../../../components/contact/TopicChips";

/** Client harness: TopicChips takes an onChange, which cannot cross a server boundary. */
export default function Harness({
  legend,
  topics,
  initial,
}: {
  legend: string;
  topics: { id: string; label: string }[];
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  return <TopicChips legend={legend} topics={topics} value={value} onChange={setValue} />;
}
