import type { Metadata } from "next";
import { Crate } from "@/components/Crate";

export const metadata: Metadata = { title: "Your crate · DJ Crate" };

export default function CratePage() {
  return (
    <>
      <h1>Your crate</h1>
      <Crate />
    </>
  );
}
