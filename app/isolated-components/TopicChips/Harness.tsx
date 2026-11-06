"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import site from "@/content/site";
import TopicChips from "../../../components/contact/TopicChips";

/**
 * Client harness: TopicChips takes an onChange, which cannot cross a server
 * boundary. Default selects the first chip, the same one the form starts on;
 * LastSelected proves the selected style is not tied to the first position.
 */
export default function Harness() {
  const { form } = site.contact;
  const s = useSearchParams().get("s") ?? "Default";
  const initial =
    s === "LastSelected" ? form.topics[form.topics.length - 1].id : form.topics[0].id;
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: 620 }}>
      <TopicChips legend={form.topicLabel} topics={form.topics} value={value} onChange={setValue} />
    </div>
  );
}
