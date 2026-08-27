"use client";

import { useState } from "react";
import Honeypot from "../../../components/contact/Honeypot";

/** Client harness: Honeypot takes an onChange, which cannot cross a server boundary. */
export default function Harness() {
  const [value, setValue] = useState("");
  return <Honeypot value={value} onChange={(e) => setValue(e.target.value)} />;
}
