import Component from "../../../components/contact/Field";
import type { ComponentProps } from "react";
import styles from "../../../components/Contact.module.css";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The resting state: label and control, nothing to correct.
  Default: {
    id: "name",
    label: "Name",
    problem: undefined,
    children: <input id="name" className={styles.input} defaultValue="Dana Whitlock" readOnly />,
  },
  // The state that matters: the field is marked and says what to fix.
  WithProblem: {
    id: "email",
    label: "Email",
    problem: "That email does not look right.",
    children: <input id="email" className={styles.input} defaultValue="dana@" aria-invalid readOnly />,
  },
  // A textarea rather than an input, proving the wrapper is control-agnostic.
  TextArea: {
    id: "body",
    label: "Message",
    problem: undefined,
    children: (
      <textarea
        id="body"
        className={styles.textarea}
        rows={5}
        defaultValue="Saw the CodeYam demo and wanted to say hello."
        readOnly
      />
    ),
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
  return (
    <div id="codeyam-capture">
      <div style={{ width: 420 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
